use axum::{
    Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::get,
};
use uuid::Uuid;

use crate::{
    AppState,
    errors::AppError,
    extractors::auth_user::AuthUser,
    models::stats::{PlayerHighlightsResponse, PlayerHistoryResponse, SeasonScope, StatsParams},
};

pub async fn get_user_history(
    State(state): State<AppState>,
    Path((game_id, player_id)): Path<(Uuid, Uuid)>,
    Query(query): Query<StatsParams>,
    user: AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let season_id = query
        .season
        .unwrap_or(SeasonScope::All)
        .to_season_id(&state, game_id)
        .await?;

    let (stats, player) = state
        .stats_service
        .get_player_history(&state, user.id, game_id, season_id, player_id)
        .await?;

    let response = PlayerHistoryResponse {
        player: player.into(),
        matches: stats.into_iter().map(|s| s.into()).collect(),
        season_id,
    };

    Ok((StatusCode::OK, Json(response)))
}

pub async fn get_player_highlights(
    State(state): State<AppState>,
    Path((game_id, player_id)): Path<(Uuid, Uuid)>,
    Query(query): Query<StatsParams>,
    user: AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let season_id = query
        .season
        .unwrap_or(SeasonScope::All)
        .to_season_id(&state, game_id)
        .await?;

    let stats = state
        .stats_service
        .get_player_highlights(&state, user.id, game_id, season_id, player_id)
        .await?;

    let response = PlayerHighlightsResponse::new(stats, season_id);

    Ok((StatusCode::OK, Json(response)))
}

pub async fn get_distributions(
    State(state): State<AppState>,
    Path(game_id): Path<Uuid>,
    Query(query): Query<StatsParams>,
    user: AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let season_id = query
        .season
        .unwrap_or(SeasonScope::All)
        .to_season_id(&state, game_id)
        .await?;

    let distribution = state
        .stats_service
        .get_distributions(&state, user.id, game_id, season_id)
        .await?;

    Ok((StatusCode::OK, Json(distribution)))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route(
            "/games/{game_id}/players/{player_id}/history",
            get(get_user_history),
        )
        .route(
            "/games/{game_id}/players/{player_id}/highlights",
            get(get_player_highlights),
        )
        .route("/games/{game_id}/distributions", get(get_distributions))
}
