use crate::{AppState, constants::SESSION_USER_KEY, error::AppError, models::user::UserDb};
use axum::{async_trait, extract::FromRequestParts, http::request::Parts};
use tower_sessions::Session;

pub struct AuthUser(pub UserDb);

// Checks user is authenticated from session cookie
#[async_trait]
impl FromRequestParts<AppState> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let session = Session::from_request_parts(parts, state)
            .await
            .map_err(|_| AppError::InternalServerError("Failed to load session".to_string()))?;

        // Check if "user_id" exists in the session
        let user_id: i32 = session
            .get(SESSION_USER_KEY)
            .await
            .map_err(|e| AppError::InternalServerError(e.to_string()))?
            .ok_or(AppError::Unauthorised("You must be logged in".to_string()))?;

        // Verify user still exists in DB - prevents "zombie" sessions if user deleted but session still valid
        let user = state
            .user_repo
            .find_by_id(&state.pool, user_id)
            .await
            .map_err(|_| AppError::InternalServerError("Database error".to_string()))?
            .ok_or(AppError::Unauthorised("User no longer exists".to_string()))?;

        // 4. Return the user
        Ok(AuthUser(user))
    }
}
