use uuid::Uuid;

use crate::{
    AppState,
    errors::{AppError, GroupError},
    models::group::GroupMemberDb,
};

pub async fn fetch_member_guarded(
    state: &AppState,
    user_id: Uuid,
    group_id: Uuid,
) -> Result<GroupMemberDb, AppError> {
    state
        .group_repo
        .get_member(&state.pool, group_id, user_id)
        .await?
        .ok_or(GroupError::MemberNotFound.into())
}
