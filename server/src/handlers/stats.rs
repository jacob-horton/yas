use axum::{
    Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::get,
};

use crate::{
    AppState,
    errors::AppError,
    extractors::auth::AuthUser,
    models::stats::{PlayerMatchResponse, PlayerStatsSummaryResponse, StatsParams},
    services,
};

pub async fn get_user_history(
    State(state): State<AppState>,
    Path((game_id, player_id)): Path<(String, String)>,
    // TODO: don't allow order by
    Query(query): Query<StatsParams>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let game_id = game_id
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid game ID".to_string()))?;

    let player_id = player_id
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid player ID".to_string()))?;

    let stats = services::stats::get_player_history(
        &state,
        user.id,
        game_id,
        player_id,
        query.num_matches.unwrap_or(10),
    )
    .await?;

    let response: Vec<PlayerMatchResponse> = stats.into_iter().map(|s| s.into()).collect();

    Ok((StatusCode::OK, Json(response)))
}

pub async fn get_user_summary(
    State(state): State<AppState>,
    Path((game_id, player_id)): Path<(String, String)>,
    // TODO: don't allow order by
    Query(query): Query<StatsParams>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let game_id = game_id
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid game ID".to_string()))?;

    let player_id = player_id
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid player ID".to_string()))?;

    let stats = services::stats::get_player_summary(
        &state,
        user.id,
        game_id,
        player_id,
        query.num_matches.unwrap_or(10),
    )
    .await?;

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
