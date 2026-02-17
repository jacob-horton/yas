use axum::{async_trait, extract::FromRequestParts, http::request::Parts};

use crate::{
    AppState,
    errors::{AppError, AuthError},
    extractors::auth::AuthUser,
    models::user::UserDb,
};

pub struct VerifiedUser(pub UserDb);

#[async_trait]
impl FromRequestParts<AppState> for VerifiedUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let AuthUser(user) = AuthUser::from_request_parts(parts, state).await?;

        if !user.email_verified {
            return Err(AuthError::UnverifiedEmail.into());
        }

        Ok(VerifiedUser(user))
    }
}
