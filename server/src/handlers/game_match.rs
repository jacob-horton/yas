use axum::{
    Extension, Json, Router,
    extract::{Path, State},
    http::StatusCode,
    middleware,
    response::IntoResponse,
    routing::post,
};
use tower::ServiceBuilder;
use uuid::Uuid;

use crate::{
    AppState,
    errors::AppError,
    extractors::{
        rate_limiting::ip::{create_ip_limiter, ip_limit_mw},
        validated_json::ValidatedJson,
        verified_user::VerifiedUser,
    },
    models::game_match::{CreateMatchReq, MatchResponse},
    services,
};

async fn create_match(
    State(state): State<AppState>,
    Path(game_id): Path<Uuid>,
    user: VerifiedUser,
    ValidatedJson(payload): ValidatedJson<CreateMatchReq>,
) -> Result<impl IntoResponse, AppError> {
    let game_match = services::game_match::create_match(&state, game_id, user.id, payload).await?;

    let response: MatchResponse = game_match.into();
    Ok((StatusCode::CREATED, Json(response)))
}

pub fn router() -> Router<AppState> {
    Router::new().route(
        "/games/:game_id/matches",
        post(create_match).layer(
            ServiceBuilder::new()
                .layer(Extension(create_ip_limiter(10, 60)))
                .layer(middleware::from_fn(ip_limit_mw)),
        ),
    )
}
