use axum::{
    Json, async_trait,
    extract::{FromRequest, Request},
    http::StatusCode,
    response::{IntoResponse, Response},
};
use governor::{Quota, RateLimiter, clock::DefaultClock, state::keyed::DefaultKeyedStateStore};
use std::{num::NonZeroU32, ops::Deref, sync::Arc, time::Duration};

pub trait RateLimitKeyExtractor {
    fn limit_key(&self) -> String;
}

pub type PayloadLimiter = RateLimiter<String, DefaultKeyedStateStore<String>, DefaultClock>;

pub fn create_payload_limiter(requests: u32, per_seconds: u64) -> Arc<PayloadLimiter> {
    let period = Duration::from_secs(per_seconds) / requests;
    Arc::new(RateLimiter::keyed(
        Quota::with_period(period)
            .unwrap()
            .allow_burst(NonZeroU32::new(requests).unwrap()),
    ))
}

pub struct RateLimitedPayload<T>(pub T);

#[async_trait]
impl<S, T, P> FromRequest<S> for RateLimitedPayload<T>
where
    S: Send + Sync,
    T: FromRequest<S> + Deref<Target = P> + Send + Sync + 'static,
    T::Rejection: IntoResponse,
    P: RateLimitKeyExtractor + Send + Sync + 'static,
{
    type Rejection = Response;

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        let limiter = req.extensions().get::<Arc<PayloadLimiter>>().cloned();

        // Run inner extractor
        let inner = T::from_request(req, state)
            .await
            .map_err(|e| e.into_response())?;

        // Check the limit
        if let Some(lim) = limiter {
            if lim.check_key(&inner.deref().limit_key()).is_err() {
                let err =
                    serde_json::json!({ "error": "Too many requests. Please try again later." });
                return Err((StatusCode::TOO_MANY_REQUESTS, Json(err)).into_response());
            }
        }

        Ok(RateLimitedPayload(inner))
    }
}

impl<T> Deref for RateLimitedPayload<T> {
    type Target = T;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
