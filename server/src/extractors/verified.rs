use std::ops::Deref;

use axum::{async_trait, extract::FromRequestParts, http::request::Parts};

use crate::{
    AppState,
    errors::{AppError, AuthError},
};

pub trait IsVerified {
    fn is_verified(&self) -> bool;
}

pub struct Verified<T>(pub T);

impl<T> Deref for Verified<T> {
    type Target = T;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

// Checks email is valid for given inner type
#[async_trait]
impl<T> FromRequestParts<AppState> for Verified<T>
where
    T: FromRequestParts<AppState, Rejection = AppError> + IsVerified + Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let inner = T::from_request_parts(parts, state).await?;

        if !inner.is_verified() {
            return Err(AuthError::UnverifiedEmail.into());
        }

        Ok(Verified(inner))
    }
}
