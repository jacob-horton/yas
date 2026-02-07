use crate::AppState;
use crate::errors::{AppError, GroupError};
use crate::models::game::GameDb;
use crate::models::group::{CreateGroupReq, GroupDb, GroupMemberDetailsDb, GroupMemberRole};
use crate::policies::GroupAction;

use uuid::Uuid;

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

pub async fn delete_group(state: &AppState, user_id: Uuid, group_id: Uuid) -> Result<(), AppError> {
    // Check user is a member
    state
        .group_repo
        .get_member(&state.pool, group_id, user_id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    state.group_repo.delete(&state.pool, group_id).await?;
    Ok(())
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

pub async fn remove_group_member(
    state: &AppState,
    user_id: Uuid,
    group_id: Uuid,
    member_id: Uuid,
) -> Result<(), AppError> {
    // Check user is a member
    let user_member = state
        .group_repo
        .get_member(&state.pool, group_id, user_id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    // Find member that's being removed
    let member_to_be_deleted = state
        .group_repo
        .get_member(&state.pool, group_id, user_id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    if !user_member
        .role
        .can_perform(GroupAction::RemoveMember(member_to_be_deleted.role))
    {
        return Err(GroupError::Forbidden.into());
    }

    state
        .group_repo
        .remove_member(&state.pool, group_id, member_id)
        .await
        .map_err(GroupError::Database)?;

    Ok(())
}
