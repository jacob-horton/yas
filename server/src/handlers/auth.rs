use crate::{
    AppState,
    constants::SESSION_USER_KEY,
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
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let user = state
        .user_repo
        .find_by_username(&state.pool, &payload.username)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()))?;

    if !services::auth::verify_password(&user.password_hash, &payload.password) {
        return Err((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()));
    }

    // Create session (sets the cookie automatically)
    session
        .insert(SESSION_USER_KEY, user.id)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let response: UserResponse = user.into();
    Ok(Json(response))
}

// Logout
async fn delete_session(session: Session) -> impl IntoResponse {
    session.delete().await.ok();
    (StatusCode::OK, "Logged out")
}

// Get current user
async fn get_session(AuthUser(user): AuthUser) -> Result<impl IntoResponse, StatusCode> {
    Ok(Json(serde_json::json!({ "user_id": user.id })))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/session", post(create_session))
        .route("/session", delete(delete_session))
        .route("/session", get(get_session))
}
