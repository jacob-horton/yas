use sqlx::types::Uuid;

use crate::AppState;

use crate::errors::{AppError, GroupError};
use crate::models::game::GameDb;
use crate::models::group::{
    CreateGroupReq, GroupDb, GroupMemberDb, GroupMemberDetailsDb, GroupMemberRole,
};
use crate::models::user::UserDb;

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

pub async fn get_group(
    state: &AppState,
    user_id: Uuid,
    group_id: Uuid,
) -> Result<GroupDb, AppError> {
    // Check user is a member
    state
        .group_repo
        .get_member(&state.pool, group_id, user_id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    get_group_without_auth_check(state, group_id).await
}

pub async fn get_group_without_auth_check(
    state: &AppState,
    group_id: Uuid,
) -> Result<GroupDb, AppError> {
    let group = state
        .group_repo
        .find_by_id(&state.pool, group_id)
        .await
        .map_err(GroupError::Database)?
        .ok_or(GroupError::NotFound)?;

    Ok(group)
}

pub async fn get_group_members(
    state: &AppState,
    user_id: Uuid,
    group_id: Uuid,
) -> Result<Vec<GroupMemberDetailsDb>, AppError> {
    // Check user is a member
    state
        .group_repo
        .get_member(&state.pool, group_id, user_id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    let group_member = state
        .group_repo
        .get_members(&state.pool, group_id)
        .await
        .map_err(GroupError::Database)?;

    Ok(group_member)
}
