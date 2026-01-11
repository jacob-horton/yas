use axum::{Json, Router, extract::State, http::StatusCode, response::IntoResponse, routing::post};

use crate::{
    AppState,
    extractors::{auth::AuthUser, validated_json::ValidatedJson},
    models::group::{CreateGroupReq, GroupResponse},
    services,
};

// Create group
async fn create_group(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    ValidatedJson(payload): ValidatedJson<CreateGroupReq>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // TODO: check user email is validated before they can start creating groups

    let group = services::group::create_group(&state, user.id, payload)
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error".to_string(),
            )
        })?;

    let response: GroupResponse = group.into();
    Ok((StatusCode::CREATED, Json(response)))
}

pub fn router() -> Router<AppState> {
    Router::new().route("/group", post(create_group))
}
