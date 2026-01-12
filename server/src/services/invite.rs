use chrono::{Months, Utc};
use sqlx::types::Uuid;

use crate::{
    AppState,
    error::AppError,
    models::{group::GroupMemberRole, invite::InviteDb},
};

pub async fn create_link(
    state: &AppState,
    group_id: i32,
    creator_id: i32,
) -> Result<InviteDb, AppError> {
    let member = state
        .group_repo
        .get_member(&state.pool, group_id, creator_id)
        .await?
        .ok_or(AppError::NotFound("Member not found".to_string()))?;

    if !(member.role == GroupMemberRole::Admin || member.role == GroupMemberRole::Owner) {
        return Err(AppError::Forbidden(
            "Must be admin or owner to create invites".to_string(),
        ));
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
        .await?)
}

pub async fn accept_invite(
    state: &AppState,
    user_id: i32,
    invite_code: Uuid,
) -> Result<(), AppError> {
    let mut tx = state.pool.begin().await?;

    let invite = state
        .invite_repo
        .find_by_code_for_update(&mut *tx, invite_code)
        .await?
        .ok_or(AppError::NotFound("Invite code not found".to_string()))?;

    // If there is a max number of uses, and they've been used up, invite is no longer valid
    if let Some(max_uses) = invite.max_uses {
        if invite.uses >= max_uses {
            return Err(AppError::Gone("Invite limit reached".to_string()));
        }
    }

    // If the invite has expired, the invite is no longer valid
    if Utc::now() >= invite.expires_at {
        return Err(AppError::Gone("Invite expired".to_string()));
    }

    // Add user to group if they aren't already
    match state
        .group_repo
        .add_member(&mut *tx, invite.group_id, user_id, GroupMemberRole::Member)
        .await
    {
        Ok(_) => {}
        Err(sqlx::Error::Database(db_err)) if db_err.is_unique_violation() => {
            return Err(AppError::Conflict("Already in this group".to_string()));
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
