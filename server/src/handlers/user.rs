use axum::{Json, Router, extract::State, http::StatusCode, response::IntoResponse, routing::post};

use crate::{
    AppState,
    errors::{AppError, UserError},
    extractors::validated_json::ValidatedJson,
    models::user::{CreateUserReq, UserResponse},
    services,
};

// Sign up
async fn create_user(
    State(state): State<AppState>,
    ValidatedJson(payload): ValidatedJson<CreateUserReq>,
) -> Result<impl IntoResponse, AppError> {
    let hash = services::auth::hash_password(&payload.password)?;

    let user = state
        .user_repo
        .create(&state.pool, &payload.username, &hash)
        .await
        .map_err(|_| UserError::UserAlreadyExists)?;

    let response: UserResponse = user.into();
    Ok((StatusCode::CREATED, Json(response)))
}

pub fn router() -> Router<AppState> {
    Router::new().route("/users", post(create_user))
}
