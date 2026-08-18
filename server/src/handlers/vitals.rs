use axum::{
    Extension, Json, Router,
    extract::State,
    http::StatusCode,
    middleware,
    routing::post,
};
use chrono::{DateTime, Utc};
use serde::Serialize;
use tokio::io::AsyncWriteExt;

use crate::{
    AppState,
    extractors::rate_limiting::ip::{create_ip_limiter, ip_limit_mw},
    models::vitals::ReportVitalReq,
};

#[derive(Serialize)]
struct VitalLogEntry<'a> {
    received_at: DateTime<Utc>,
    name: &'a str,
    value: f64,
    rating: &'a str,
    id: &'a str,
    navigation_type: &'a str,
    url: Option<&'a str>,
}

async fn report_vital(
    State(state): State<AppState>,
    Json(payload): Json<ReportVitalReq>,
) -> StatusCode {
    let entry = VitalLogEntry {
        received_at: Utc::now(),
        name: &payload.name,
        value: payload.value,
        rating: &payload.rating,
        id: &payload.id,
        navigation_type: &payload.navigation_type,
        url: payload.url.as_deref(),
    };

    if let Ok(line) = serde_json::to_string(&entry) {
        let mut file = state.vitals_log.lock().await;
        let _ = file.write_all(format!("{line}\n").as_bytes()).await;
    }

    StatusCode::NO_CONTENT
}

pub fn router() -> Router<crate::AppState> {
    Router::new().route(
        "/vitals",
        post(report_vital)
            .route_layer(middleware::from_fn(ip_limit_mw))
            .route_layer(Extension(create_ip_limiter(60, 60))),
    )
}
