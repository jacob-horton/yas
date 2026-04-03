use axum::extract::Request;
use axum::middleware::Next;
use std::net::IpAddr;
use std::num::NonZeroU32;
use std::sync::Arc;
use std::time::Duration;

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
    req: Request,
    next: Next,
) -> Response {
    let ip = extract_ip(&req);

    if let Some(ip) = ip {
        if limiter.check_key(&ip).is_err() {
            let err = serde_json::json!({ "error": "IP limit exceeded" });
            return (StatusCode::TOO_MANY_REQUESTS, Json(err)).into_response();
        }
    }

    next.run(req).await
}

// Extracts real IP from before cloudflare (normal IP will just be cloudflare)
fn extract_ip(req: &Request) -> Option<IpAddr> {
    // 1. Cloudflare
    if let Some(cf_ip) = req.headers().get("cf-connecting-ip") {
        if let Ok(s) = cf_ip.to_str() {
            if let Ok(ip) = s.parse::<IpAddr>() {
                return Some(ip);
            }
        }
    }

    // 2. X-Forwarded-For fallback
    if let Some(xff) = req.headers().get("x-forwarded-for") {
        if let Ok(s) = xff.to_str() {
            if let Some(first) = s.split(',').next() {
                if let Ok(ip) = first.trim().parse::<IpAddr>() {
                    return Some(ip);
                }
            }
        }
    }

    None
}
