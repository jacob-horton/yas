use crate::AppState;

use crate::error::AppError;
use crate::models::group::{CreateGroupReq, GroupDb, GroupMemberRole};

// TODO: should this be concerned with status codes?
pub async fn create_group(
    state: &AppState,
    owner_id: i32,
    payload: CreateGroupReq,
) -> Result<GroupDb, AppError> {
    let mut tx = state.pool.begin().await?;

    // Create group
    let group = state
        .group_repo
        .create(&mut *tx, &payload.name, owner_id)
        .await?;

    // Add user as owner of the group
    state
        .group_repo
        .add_member(&mut *tx, group.id, owner_id, GroupMemberRole::Owner)
        .await?;

    tx.commit().await?;

    Ok(group)
}
