use axum::extract::Request;
use axum::middleware::Next;
use std::net::{IpAddr, SocketAddr};
use std::num::NonZeroU32;
use std::sync::Arc;
use std::time::Duration;

use axum::extract::ConnectInfo;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::{Extension, Json};
use governor::clock::DefaultClock;
use governor::state::keyed::DefaultKeyedStateStore;
use governor::{Quota, RateLimiter};

pub type IpLimiter = RateLimiter<IpAddr, DefaultKeyedStateStore<IpAddr>, DefaultClock>;

pub fn create_ip_limiter(requests: u32, per_seconds: u64) -> Arc<IpLimiter> {
    let period = Duration::from_secs(per_seconds) / requests;
    Arc::new(RateLimiter::keyed(
        Quota::with_period(period)
            .unwrap()
            .allow_burst(NonZeroU32::new(requests).unwrap()),
    ))
}

pub async fn ip_limit_mw(
    Extension(limiter): Extension<Arc<IpLimiter>>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    req: Request,
    next: Next,
) -> Response {
    if limiter.check_key(&addr.ip()).is_err() {
        let err = serde_json::json!({ "error": "IP limit exceeded" });
        return (StatusCode::TOO_MANY_REQUESTS, Json(err)).into_response();
    }

    next.run(req).await
}
