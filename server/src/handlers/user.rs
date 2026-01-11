use axum::{Json, Router, extract::State, http::StatusCode, response::IntoResponse, routing::post};

use crate::{
    AppState,
    extractors::validated_json::ValidatedJson,
    models::user::{CreateUserReq, UserResponse},
    services,
};

// Sign up
async fn create_user(
    State(state): State<AppState>,
    ValidatedJson(payload): ValidatedJson<CreateUserReq>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let hash = services::auth::hash_password(&payload.password)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;

    let user = state
        .user_repo
        .create(&state.pool, &payload.username, &hash)
        .await
        .map_err(|_| (StatusCode::CONFLICT, "Username taken".to_string()))?;

    let response: UserResponse = user.into();
    Ok((StatusCode::CREATED, Json(response)))
}

pub fn router() -> Router<AppState> {
    Router::new().route("/user", post(create_user))
}
