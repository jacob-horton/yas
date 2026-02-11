use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::get,
};
use uuid::Uuid;

use crate::{
    AppState,
    errors::AppError,
    extractors::auth::AuthUser,
    models::stats::{PlayerMatchResponse, PlayerStatsSummaryResponse},
    services,
};

pub async fn get_user_history(
    State(state): State<AppState>,
    Path((game_id, player_id)): Path<(Uuid, Uuid)>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let stats = services::stats::get_player_history(&state, user.id, game_id, player_id).await?;

    let response: Vec<PlayerMatchResponse> = stats.into_iter().map(|s| s.into()).collect();

    Ok((StatusCode::OK, Json(response)))
}

pub async fn get_user_summary(
    State(state): State<AppState>,
    Path((game_id, player_id)): Path<(Uuid, Uuid)>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let stats = services::stats::get_player_summary(&state, user.id, game_id, player_id).await?;

    let response: PlayerStatsSummaryResponse = stats.into();

    Ok((StatusCode::OK, Json(response)))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route(
            "/games/:gameId/players/:playerId/history",
            get(get_user_history),
        )
        .route(
            "/games/:gameId/players/:playerId/summary",
            get(get_user_summary),
        )
}
