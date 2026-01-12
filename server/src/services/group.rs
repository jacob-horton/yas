use sqlx::types::Uuid;

use crate::AppState;

use crate::errors::{AppError, GroupError};
use crate::models::group::{CreateGroupReq, GroupDb, GroupMemberRole};

pub async fn create_group(
    state: &AppState,
    owner_id: Uuid,
    payload: CreateGroupReq,
) -> Result<GroupDb, AppError> {
    let mut tx = state.pool.begin().await?;

    // Create group
    let group = state
        .group_repo
        .create(&mut *tx, &payload.name, owner_id)
        .await
        .map_err(GroupError::Database)?;

    // Add user as owner of the group
    state
        .group_repo
        .add_member(&mut *tx, group.id, owner_id, GroupMemberRole::Owner)
        .await
        .map_err(GroupError::Database)?;

    tx.commit().await?;

    Ok(group)
}
