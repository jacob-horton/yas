use crate::{AppState, constants::SESSION_USER_KEY, models::user::UserDb};
use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{StatusCode, request::Parts},
};
use tower_sessions::Session;

pub struct AuthUser(pub UserDb);

#[async_trait]
impl FromRequestParts<AppState> for AuthUser {
    type Rejection = (StatusCode, String);

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let session = Session::from_request_parts(parts, state)
            .await
            .map_err(|_| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Failed to load session".to_string(),
                )
            })?;

        // Check if "user_id" exists in the session
        let user_id: i32 = session
            .get(SESSION_USER_KEY)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
            .ok_or((
                StatusCode::UNAUTHORIZED,
                "You must be logged in".to_string(),
            ))?;

        // Verify user still exists in DB - prevents "zombie" sessions if user deleted but session still valid
        let user = state
            .user_repo
            .find_by_id(user_id)
            .await
            .map_err(|_| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Database error".to_string(),
                )
            })?
            .ok_or((
                StatusCode::UNAUTHORIZED,
                "User no longer exists".to_string(),
            ))?;

        // 4. Return the user
        Ok(AuthUser(user))
    }
}
