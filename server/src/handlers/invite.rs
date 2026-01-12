use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::post,
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
        .route("/invites/:code/accept", post(accept_invite))
}
