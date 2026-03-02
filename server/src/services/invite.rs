use chrono::{DateTime, Months, Utc};
use uuid::Uuid;

use crate::{
    AppState,
    errors::{AppError, GroupError, InviteError},
    models::{
        group::GroupMemberDb,
        invite::{CreateInviteReq, InviteDb, InviteWithCreatedByNameDb},
        user::UserDb,
    },
    policies::GroupAction,
};

pub async fn create_link(
    state: &AppState,
    creator: GroupMemberDb,
    payload: CreateInviteReq,
) -> Result<InviteDb, AppError> {
    if !creator.role.can_perform(GroupAction::CreateInvite) {
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
            creator.group_id,
            creator.user_id,
            payload.name,
            payload.role,
            payload.max_uses,
            payload
                .email_whitelist
                .into_iter()
                .map(|e| e.address)
                .collect(),
            Some(expires_at),
        )
        .await
        .map_err(InviteError::Database)?)
}

pub async fn accept_invite(
    state: &AppState,
    user: UserDb,
    invite_code: Uuid,
) -> Result<(), AppError> {
    let mut tx = state.pool.begin().await?;

    let invite = state
        .invite_repo
        .find_by_code_for_update(&mut *tx, invite_code)
        .await
        .map_err(InviteError::Database)?
        .ok_or(InviteError::NotFound)?;

    validate_invite(&invite, &user.email)?;

    // Add user to group if they aren't already
    match state
        .group_repo
        .add_member(&mut *tx, invite.group_id, user.id, invite.role)
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
    user_email: &str,
) -> Result<InviteWithCreatedByNameDb, AppError> {
    let invite = state
        .invite_repo
        .find_by_code(&state.pool, invite_code)
        .await
        .map_err(InviteError::Database)?
        .ok_or(InviteError::NotFound)?;

    validate_invite(&invite, user_email)?;

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

pub fn validate_invite(invite: &InviteWithCreatedByNameDb, email: &str) -> Result<(), AppError> {
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

    // If email not in whitelist, they aren't allowed to view/accept
    // If whitelist is empty, all emails are allowed
    if !invite.email_whitelist.is_empty() && !invite.email_whitelist.contains(&email.to_string()) {
        return Err(InviteError::NotInWhitelist.into());
    }

    Ok(())
}

pub async fn get_group_invites(
    state: &AppState,
    member: GroupMemberDb,
) -> Result<Vec<InviteWithCreatedByNameDb>, AppError> {
    if !member.role.can_perform(GroupAction::ViewInvites) {
        return Err(GroupError::Forbidden.into());
    }

    let group = state
        .invite_repo
        .get_invites_for_group(&state.pool, member.group_id)
        .await
        .map_err(GroupError::Database)?;

    Ok(group)
}
