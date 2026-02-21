use axum::extract::FromRef;
use std::ops::Deref;
use std::sync::Arc;

use axum::extract::{FromRequest, Request};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::{Json, async_trait};
use governor::RateLimiter;
use governor::clock::DefaultClock;
use governor::state::keyed::DefaultKeyedStateStore;

use crate::AppState;

pub type EmailLimiter = RateLimiter<String, DefaultKeyedStateStore<String>, DefaultClock>;

pub trait EmailLimitConfig {
    // Email extractor - used for email rate limiting
    fn email(&self) -> &str;
    fn email_limiter(state: &AppState) -> &Arc<EmailLimiter>;
}

// Wrapper for extractor to rate limit using emails
pub struct EmailLimited<E>(pub E);

#[async_trait]
impl<S, E, T> FromRequest<S> for EmailLimited<E>
where
    S: Send + Sync,
    AppState: axum::extract::FromRef<S>,
    E: FromRequest<S> + Send + Sync + 'static,
    E::Rejection: IntoResponse,
    E: Deref<Target = T>,
    T: EmailLimitConfig,
{
    type Rejection = Response;

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = AppState::from_ref(state);

        // Run extractor
        let inner_extractor = E::from_request(req, state)
            .await
            .map_err(|e| e.into_response())?;

        // Check email rate limit
        let normalized_email = inner_extractor.deref().email().to_lowercase();
        let email_limiter = T::email_limiter(&app_state);

        if email_limiter.check_key(&normalized_email).is_err() {
            let error_body = serde_json::json!({
                "error": "Email limit exceeded"
            });
            return Err((StatusCode::TOO_MANY_REQUESTS, Json(error_body)).into_response());
        }

        Ok(EmailLimited(inner_extractor))
    }
}
