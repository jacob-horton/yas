use crate::AppState;
use crate::errors::{AppError, GroupError};
use crate::models::game::GameDb;
use crate::models::group::{
    CreateGroupReq, GroupDb, GroupMemberDb, GroupMemberResponse, GroupMemberRole, GroupWithRole,
    OrderBy, UpdateGroupReq,
};
use crate::models::stats::OrderDir;
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

pub async fn update_group(
    state: &AppState,
    member: GroupMemberDb,
    payload: UpdateGroupReq,
) -> Result<GroupDb, AppError> {
    if !member.role.can_perform(GroupAction::UpdateGroup) {
        return Err(GroupError::Forbidden.into());
    }

    // Update group
    let group = state
        .group_repo
        .update(&state.pool, member.group_id, &payload.name)
        .await
        .map_err(GroupError::Database)?;

    Ok(group)
}

pub async fn get_games_in_group(state: &AppState, group_id: Uuid) -> Result<Vec<GameDb>, AppError> {
    let games = state
        .game_repo
        .get_games_in_group(&state.pool, group_id)
        .await
        .map_err(GroupError::Database)?;

    Ok(games)
}

pub async fn get_group(state: &AppState, member: GroupMemberDb) -> Result<GroupWithRole, AppError> {
    let group = state
        .group_repo
        .find_by_id(&state.pool, member.group_id)
        .await
        .map_err(GroupError::Database)?
        .ok_or(GroupError::NotFound)?;

    Ok(GroupWithRole {
        id: group.id,
        name: group.name,
        created_at: group.created_at,
        created_by: group.created_by,
        my_role: member.role,
    })
}

pub async fn get_group_raw(state: &AppState, group_id: Uuid) -> Result<GroupDb, AppError> {
    let group = state
        .group_repo
        .find_by_id(&state.pool, group_id)
        .await
        .map_err(GroupError::Database)?
        .ok_or(GroupError::NotFound)?;

    Ok(group)
}

pub async fn delete_group(state: &AppState, member: GroupMemberDb) -> Result<(), AppError> {
    state
        .group_repo
        .delete(&state.pool, member.group_id)
        .await?;
    Ok(())
}

pub async fn get_group_members(
    state: &AppState,
    member: GroupMemberDb,
    order_by: OrderBy,
    order_dir: OrderDir,
) -> Result<Vec<GroupMemberResponse>, AppError> {
    let group_members = state
        .group_repo
        .get_members(&state.pool, member.group_id, order_by, order_dir)
        .await
        .map_err(GroupError::Database)?;

    // Convert to response. Email is hidden if user doesn't have perms to view
    let response: Vec<GroupMemberResponse> = group_members
        .into_iter()
        .map(|m| GroupMemberResponse::from_db(m, member.role))
        .collect();

    Ok(response)
}

pub async fn remove_group_member(
    state: &AppState,
    member: GroupMemberDb,
    member_to_remove_id: Uuid,
) -> Result<(), AppError> {
    // Find member that's being removed
    let member_to_be_deleted = state
        .group_repo
        .get_member(&state.pool, member.group_id, member_to_remove_id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    // Can remove if it's yourself, or someone lower rank
    if member_to_remove_id != member.user_id
        && !member
            .role
            .can_perform(GroupAction::RemoveMember(member_to_be_deleted.role))
    {
        return Err(GroupError::Forbidden.into());
    }

    state
        .group_repo
        .remove_member(&state.pool, member.group_id, member_to_remove_id)
        .await
        .map_err(GroupError::Database)?;

    Ok(())
}

pub async fn set_member_role(
    state: &AppState,
    user_member: GroupMemberDb,
    member_to_set_id: Uuid,
    role: GroupMemberRole,
) -> Result<GroupMemberDb, AppError> {
    // Update member role
    let member_to_be_updated = state
        .group_repo
        .get_member(&state.pool, user_member.group_id, member_to_set_id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    if !user_member
        .role
        .can_perform(GroupAction::UpdateRole(member_to_be_updated.role, role))
    {
        return Err(GroupError::Forbidden.into());
    }

    let member = state
        .group_repo
        .update_member_role(&state.pool, user_member.group_id, member_to_set_id, role)
        .await
        .map_err(GroupError::Database)?;

    Ok(member)
}
