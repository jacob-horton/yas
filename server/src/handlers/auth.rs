use crate::{
    AppState,
    constants::SESSION_USER_KEY,
    extractors::AuthUser,
    models::user::{CreateSessionReq, CreateUserReq, UserResponse},
    services,
};
use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use tower_sessions::Session;

// Sign up
pub async fn create_user(
    State(state): State<AppState>,
    Json(payload): Json<CreateUserReq>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let hash = services::auth::hash_password(&payload.password)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;

    let user = state
        .user_repo
        .create(&payload.username, &hash)
        .await
        .map_err(|_| (StatusCode::CONFLICT, "Username taken".to_string()))?;

    let response: UserResponse = user.into();
    Ok((StatusCode::CREATED, Json(response)))
}

// Login
pub async fn create_session(
    State(state): State<AppState>,
    session: Session,
    Json(payload): Json<CreateSessionReq>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let user = state
        .user_repo
        .find_by_username(&payload.username)
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
pub async fn delete_session(session: Session) -> impl IntoResponse {
    session.delete().await.ok();
    (StatusCode::OK, "Logged out")
}

// Get current user
pub async fn get_session(AuthUser(user): AuthUser) -> Result<impl IntoResponse, StatusCode> {
    Ok(Json(serde_json::json!({ "user_id": user.id })))
}
