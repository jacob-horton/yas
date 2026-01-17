use sqlx::types::Uuid;

use crate::AppState;

use crate::errors::{AppError, GroupError};
use crate::models::game::GameDb;
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

pub async fn get_games_in_group(
    state: &AppState,
    user_id: Uuid,
    group_id: Uuid,
) -> Result<Vec<GameDb>, AppError> {
    // Check user is a member
    state
        .group_repo
        .get_member(&state.pool, group_id, user_id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    let games = state
        .game_repo
        .get_games_in_group(&state.pool, group_id)
        .await
        .map_err(GroupError::Database)?;

    Ok(games)
}
