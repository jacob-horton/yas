use axum::extract::{FromRef, FromRequestParts};
use axum::http::request::Parts;
use std::marker::PhantomData;
use std::net::{IpAddr, SocketAddr};
use std::sync::Arc;

use axum::extract::ConnectInfo;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::{Json, async_trait};
use governor::RateLimiter;
use governor::clock::DefaultClock;
use governor::state::keyed::DefaultKeyedStateStore;

use crate::AppState;

pub type IpLimiter = RateLimiter<IpAddr, DefaultKeyedStateStore<IpAddr>, DefaultClock>;

pub trait IpLimitConfig {
    fn limiter(state: &AppState) -> &Arc<IpLimiter>;
}

// Extractor to ensure rate limiting
pub struct RequireIpLimit<T>(PhantomData<T>);

#[async_trait]
impl<S, T> FromRequestParts<S> for RequireIpLimit<T>
where
    S: Send + Sync,
    AppState: FromRef<S>,
    T: IpLimitConfig + Send + Sync + 'static,
{
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = AppState::from_ref(state);

        let ConnectInfo(addr) = parts
            .extensions
            .get::<ConnectInfo<SocketAddr>>()
            .expect("ConnectInfo layer missing");

        let limiter = T::limiter(&app_state);

        if limiter.check_key(&addr.ip()).is_err() {
            let error_body = serde_json::json!({
                "error": "IP limit exceeded for this endpoint."
            });
            return Err((StatusCode::TOO_MANY_REQUESTS, Json(error_body)).into_response());
        }

        Ok(RequireIpLimit(PhantomData))
    }
}
