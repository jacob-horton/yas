use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post},
};

use crate::{
    AppState,
    errors::AppError,
    extractors::{auth::AuthUser, validated_json::ValidatedJson},
    models::group::{CreateGroupReq, GroupMemberResponse, GroupResponse},
    services,
};

async fn create_group(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    ValidatedJson(payload): ValidatedJson<CreateGroupReq>,
) -> Result<impl IntoResponse, AppError> {
    // TODO: check user email is validated before they can start creating groups

    let group = services::group::create_group(&state, user.id, payload).await?;

    let response: GroupResponse = group.into();
    Ok((StatusCode::CREATED, Json(response)))
}

async fn get_group_details(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    Path(group_id): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let group_id = group_id
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid group ID".to_string()))?;

    let group = services::group::get_group(&state, user.id, group_id).await?;

    let response: GroupResponse = group.into();
    Ok((StatusCode::OK, Json(response)))
}

async fn delete_group(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    Path(group_id): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let group_id = group_id
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid group ID".to_string()))?;

    services::group::delete_group(&state, user.id, group_id).await?;

    Ok(StatusCode::NO_CONTENT)
}

async fn get_group_members(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    Path(group_id): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let group_id = group_id
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid group ID".to_string()))?;

    let members = services::group::get_group_members(&state, user.id, group_id).await?;

    let response: Vec<GroupMemberResponse> = members.into_iter().map(|m| m.into()).collect();
    Ok((StatusCode::OK, Json(response)))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/groups", post(create_group))
        .route("/groups/:id", get(get_group_details))
        .route("/groups/:id", delete(delete_group))
        .route("/groups/:id/members", get(get_group_members))
}
