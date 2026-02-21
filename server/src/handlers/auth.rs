use std::sync::Arc;

use crate::{
    AppState,
    constants::{SESSION_USER_KEY, SESSION_VERSION_KEY},
    errors::{AppError, AuthError},
    extractors::{
        auth::AuthUser,
        rate_limiting::{
            email::EmailLimited,
            ip::{IpLimitConfig, IpLimiter, RequireIpLimit},
        },
        validated_json::ValidatedJson,
    },
    models::{
        auth::{CreateSessionReq, VerifyEmailReq},
        user::UserResponse,
    },
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

struct LoginRoute;
impl IpLimitConfig for LoginRoute {
    fn limiter(state: &AppState) -> &Arc<IpLimiter> {
        &state.rate_limiters.login_ip_limiter
    }
}

struct VerifyEmailRoute;
impl IpLimitConfig for VerifyEmailRoute {
    fn limiter(state: &AppState) -> &Arc<IpLimiter> {
        &state.rate_limiters.verify_email_ip_limiter
    }
}

// Login
async fn create_session(
    State(state): State<AppState>,
    _ip_limiter: RequireIpLimit<LoginRoute>,
    session: Session,
    EmailLimited(ValidatedJson(payload)): EmailLimited<ValidatedJson<CreateSessionReq>>,
) -> Result<impl IntoResponse, AppError> {
    let user = state
        .user_repo
        .find_by_email(&state.pool, &payload.email)
        .await?
        .ok_or(AuthError::InvalidCredentials)?;

    if !services::auth::verify_password(&user.password_hash, &payload.password) {
        return Err(AuthError::InvalidCredentials.into());
    }

    // Cycle ID to prevent Session Fixation attacks
    session
        .cycle_id()
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    // Create session (sets the cookie automatically)
    session
        .insert(SESSION_USER_KEY, user.id.to_string())
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    // Save session version
    session
        .insert(SESSION_VERSION_KEY, user.session_version)
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
async fn get_session(user: AuthUser) -> Result<impl IntoResponse, AppError> {
    Ok(Json(serde_json::json!({ "user_id": user.id.to_string() })))
}

// Verify email address
async fn verify_email(
    _ip_limiter: RequireIpLimit<VerifyEmailRoute>,
    State(state): State<AppState>,
    Json(payload): Json<VerifyEmailReq>,
) -> Result<impl IntoResponse, AppError> {
    services::auth::verify_email(&state, payload.token).await?;

    Ok(StatusCode::NO_CONTENT)
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/sessions", post(create_session))
        .route("/sessions", delete(delete_session))
        .route("/sessions", get(get_session))
        .route("/verify-email", post(verify_email))
}
