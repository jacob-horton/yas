use chrono::{DateTime, Months, Utc};
use uuid::Uuid;

use crate::{
    AppState,
    errors::{AppError, GroupError, InviteError},
    models::{
        group::GroupMemberRole,
        invite::{CreateInviteReq, InviteDb, InviteWithCreatedByNameDb},
    },
    policies::GroupAction,
};

pub async fn create_link(
    state: &AppState,
    group_id: Uuid,
    creator_id: Uuid,
    payload: CreateInviteReq,
) -> Result<InviteDb, AppError> {
    let member = state
        .group_repo
        .get_member(&state.pool, group_id, creator_id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    if !member.role.can_perform(GroupAction::CreateInvite) {
        return Err(GroupError::Forbidden.into());
    }

    // Expires at - default to 1 month from now
    let expires_at =
        match payload.expires_at {
            Some(date) => DateTime::parse_from_rfc3339(&date)
                .map_err(|_| AppError::BadRequest("Invalid date format".to_string()))?
                .to_utc(),
            None => Utc::now().checked_add_months(Months::new(1)).ok_or(
                AppError::InternalServerError("Date calculation failed".to_string()),
            )?,
        };

    Ok(state
        .invite_repo
        .create(
            &state.pool,
            group_id,
            creator_id,
            payload.name,
            payload.max_uses,
            Some(expires_at),
        )
        .await
        .map_err(InviteError::Database)?)
}

pub async fn accept_invite(
    state: &AppState,
    user_id: Uuid,
    invite_code: Uuid,
) -> Result<(), AppError> {
    let mut tx = state.pool.begin().await?;

    let invite = state
        .invite_repo
        .find_by_code_for_update(&mut *tx, invite_code)
        .await
        .map_err(InviteError::Database)?
        .ok_or(InviteError::NotFound)?;

    validate_invite(&invite)?;

    // Add user to group if they aren't already
    match state
        .group_repo
        .add_member(&mut *tx, invite.group_id, user_id, GroupMemberRole::Member)
        .await
    {
        Ok(_) => {}
        Err(sqlx::Error::Database(db_err)) if db_err.is_unique_violation() => {
            return Err(GroupError::UserAlreadyMember.into());
        }
        Err(e) => return Err(AppError::Database(e)),
    }

    // Increment number of uses
    state
        .invite_repo
        .increment_uses(&mut *tx, invite_code)
        .await?;

    tx.commit().await?;

    Ok(())
}

pub async fn get_invite(
    state: &AppState,
    invite_code: Uuid,
) -> Result<InviteWithCreatedByNameDb, AppError> {
    let invite = state
        .invite_repo
        .find_by_code_for_update(&state.pool, invite_code)
        .await
        .map_err(InviteError::Database)?
        .ok_or(InviteError::NotFound)?;

    validate_invite(&invite)?;

    Ok(invite)
}

pub async fn delete_invite(state: &AppState, invite_code: Uuid) -> Result<(), AppError> {
    state
        .invite_repo
        .delete(&state.pool, invite_code)
        .await
        .map_err(InviteError::Database)?;

    Ok(())
}

pub fn validate_invite(invite: &InviteWithCreatedByNameDb) -> Result<(), AppError> {
    // If there is a max number of uses, and they've been used up, invite is no longer valid
    if let Some(max_uses) = invite.max_uses {
        if invite.uses >= max_uses {
            return Err(InviteError::LimitReached.into());
        }
    }

    // If the invite has expired, the invite is no longer valid
    if Utc::now() >= invite.expires_at {
        return Err(InviteError::Expired.into());
    }

    Ok(())
}

pub async fn get_group_invites(
    state: &AppState,
    user_id: Uuid,
    group_id: Uuid,
) -> Result<Vec<InviteWithCreatedByNameDb>, AppError> {
    // Check user is a member
    state
        .group_repo
        .get_member(&state.pool, group_id, user_id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    let group = state
        .invite_repo
        .get_invites_for_group(&state.pool, group_id)
        .await
        .map_err(GroupError::Database)?;

    Ok(group)
}
