use chrono::{Months, Utc};
use sqlx::types::Uuid;

use crate::{
    AppState,
    errors::{AppError, GroupError, InviteError},
    models::{group::GroupMemberRole, invite::InviteDb},
};

pub async fn create_link(
    state: &AppState,
    group_id: Uuid,
    creator_id: Uuid,
) -> Result<InviteDb, AppError> {
    let member = state
        .group_repo
        .get_member(&state.pool, group_id, creator_id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    if !(member.role == GroupMemberRole::Admin || member.role == GroupMemberRole::Owner) {
        return Err(GroupError::Forbidden.into());
    }

    // Expires after 1 month
    let expires_at =
        Utc::now()
            .checked_add_months(Months::new(1))
            .ok_or(AppError::InternalServerError(
                "Date calculation failed".to_string(),
            ))?;

    Ok(state
        .invite_repo
        .create(&state.pool, group_id, creator_id, None, Some(expires_at))
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
