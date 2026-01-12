use axum::{Json, Router, extract::State, http::StatusCode, response::IntoResponse, routing::post};

use crate::{
    AppState,
    errors::AppError,
    extractors::{auth::AuthUser, validated_json::ValidatedJson},
    handlers::invite::create_invite,
    models::group::{CreateGroupReq, GroupResponse},
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

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/groups", post(create_group))
        .route("/groups/:id/invites", post(create_invite))
}
