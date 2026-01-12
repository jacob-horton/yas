use crate::{
    AppState,
    constants::SESSION_USER_KEY,
    error::AppError,
    extractors::{auth::AuthUser, validated_json::ValidatedJson},
    models::{auth::CreateSessionReq, user::UserResponse},
    services,
};
use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post},
};
use tower_sessions::Session;

// Login
async fn create_session(
    State(state): State<AppState>,
    session: Session,
    ValidatedJson(payload): ValidatedJson<CreateSessionReq>,
) -> Result<impl IntoResponse, AppError> {
    let user = state
        .user_repo
        .find_by_username(&state.pool, &payload.username)
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?
        .ok_or(AppError::Unauthorised("Invalid credentials".to_string()))?;

    if !services::auth::verify_password(&user.password_hash, &payload.password) {
        return Err(AppError::Unauthorised("Invalid credentials".to_string()));
    }

    // Create session (sets the cookie automatically)
    session
        .insert(SESSION_USER_KEY, user.id)
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    let response: UserResponse = user.into();
    Ok(Json(response))
}

// Logout
async fn delete_session(session: Session) -> impl IntoResponse {
    session.delete().await.ok();
    (StatusCode::OK, "Logged out")
}

// Get current user
async fn get_session(AuthUser(user): AuthUser) -> Result<impl IntoResponse, AppError> {
    Ok(Json(serde_json::json!({ "user_id": user.id })))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/sessions", post(create_session))
        .route("/sessions", delete(delete_session))
        .route("/sessions", get(get_session))
}
