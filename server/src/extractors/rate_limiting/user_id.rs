use crate::{
    AppState,
    constants::SESSION_USER_KEY,
    errors::{AppError, AuthError},
};
use axum::{async_trait, extract::FromRequestParts, http::request::Parts};
use governor::{RateLimiter, clock::DefaultClock, state::keyed::DefaultKeyedStateStore};
use std::{marker::PhantomData, ops::Deref, sync::Arc};
use tower_sessions::Session;
use uuid::Uuid;

pub type UserIdLimiter = RateLimiter<Uuid, DefaultKeyedStateStore<Uuid>, DefaultClock>;

pub trait UserLimitConfig {
    fn limiter(state: &AppState) -> &Arc<UserIdLimiter>;
}

pub struct RateLimitedUser<R, E>(pub E, pub PhantomData<R>);

impl<R, E> Deref for RateLimitedUser<R, E> {
    type Target = E;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[async_trait]
impl<R, E> FromRequestParts<AppState> for RateLimitedUser<R, E>
where
    R: UserLimitConfig + Send + Sync + 'static,
    E: FromRequestParts<AppState, Rejection = AppError> + Send + Sync + 'static,
{
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let session = Session::from_request_parts(parts, state)
            .await
            .map_err(|_| AppError::InternalServerError("Failed to load session".into()))?;

        let user_id: Uuid = session
            .get::<String>(SESSION_USER_KEY)
            .await
            .map_err(|e| AppError::InternalServerError(e.to_string()))?
            .ok_or(AuthError::InvalidSession)?
            .parse()
            .map_err(|_| AuthError::InvalidSession)?;

        let limiter = R::limiter(state);

        if limiter.check_key(&user_id).is_err() {
            return Err(AppError::InternalServerError("Too many requests".into()));
        }
        let inner_extractor = E::from_request_parts(parts, state).await?;

        Ok(RateLimitedUser(inner_extractor, PhantomData))
    }
}
