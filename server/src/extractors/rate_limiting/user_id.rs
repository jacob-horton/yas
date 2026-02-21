use crate::constants::SESSION_USER_KEY;
use axum::{
    Extension, Json,
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use governor::{Quota, RateLimiter, clock::DefaultClock, state::keyed::DefaultKeyedStateStore};
use std::sync::Arc;
use std::{num::NonZeroU32, time::Duration};
use tower_sessions::Session;
use uuid::Uuid;

pub type UserLimiter = RateLimiter<Uuid, DefaultKeyedStateStore<Uuid>, DefaultClock>;

pub fn create_user_limiter(requests: u32, per_seconds: u64) -> Arc<UserLimiter> {
    let period = Duration::from_secs(per_seconds) / requests;
    Arc::new(RateLimiter::keyed(
        Quota::with_period(period)
            .unwrap()
            .allow_burst(NonZeroU32::new(requests).unwrap()),
    ))
}

pub async fn user_limit_mw(
    Extension(limiter): Extension<Arc<UserLimiter>>,
    session: Session,
    req: Request,
    next: Next,
) -> Response {
    let Ok(Some(user_id_str)) = session.get::<String>(SESSION_USER_KEY).await else {
        return (StatusCode::UNAUTHORIZED, "Unauthorized").into_response();
    };

    let Ok(user_id) = user_id_str.parse::<Uuid>() else {
        return (StatusCode::UNAUTHORIZED, "Unauthorized").into_response();
    };

    if limiter.check_key(&user_id).is_err() {
        let err = serde_json::json!({ "error": "User limit exceeded" });
        return (StatusCode::TOO_MANY_REQUESTS, Json(err)).into_response();
    }

    next.run(req).await
}
