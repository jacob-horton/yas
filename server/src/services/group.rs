use crate::AppState;

use crate::models::group::{CreateGroupReq, GroupDb};
use axum::http::StatusCode;

pub async fn create_group(
    state: &AppState,
    owner_id: i32,
    payload: CreateGroupReq,
) -> Result<GroupDb, (StatusCode, String)> {
    let mut tx = state
        .pool
        .begin()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Create group
    let group = state
        .group_repo
        .create(&mut *tx, &payload.name, owner_id)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Add user as member
    state
        .group_repo
        .add_member(&mut *tx, group.id, owner_id)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    tx.commit()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(group)
}
