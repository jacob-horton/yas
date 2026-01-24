use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};

use crate::{
    AppState, errors::AppError, extractors::auth::AuthUser, models::invite::InviteResponse,
    services,
};

pub async fn create_invite(
    Path((group_id,)): Path<(String,)>,
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let group_id = group_id
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid group ID".to_string()))?;

    let invite = services::invite::create_link(&state, group_id, user.id).await?;

    let response: InviteResponse = invite.into();
    Ok((StatusCode::CREATED, Json(response)))
}

pub async fn get_group_invites(
    Path((group_id,)): Path<(String,)>,
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let group_id = group_id
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid group ID".to_string()))?;

    let invites = services::invite::get_group_invites(&state, user.id, group_id).await?;

    let response: Vec<InviteResponse> = invites.into_iter().map(|invite| invite.into()).collect();
    Ok((StatusCode::CREATED, Json(response)))
}

async fn accept_invite(
    Path((code,)): Path<(String,)>,
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let code = code
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid invite code".to_string()))?;

    services::invite::accept_invite(&state, user.id, code).await?;

    Ok(StatusCode::NO_CONTENT)
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/groups/:id/invites", post(create_invite))
        .route("/groups/:id/invites", get(get_group_invites))
        .route("/invites/:code/accept", post(accept_invite))
}
