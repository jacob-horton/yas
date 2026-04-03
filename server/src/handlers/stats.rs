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
    extractors::auth_user::AuthUser,
    models::stats::{PlayerHighlightsResponse, PlayerHistoryResponse},
};

pub async fn get_user_history(
    State(state): State<AppState>,
    Path((game_id, player_id)): Path<(Uuid, Uuid)>,
    user: AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let (stats, player) = state
        .stats_service
        .get_player_history(&state, user.id, game_id, player_id)
        .await?;

    let response = PlayerHistoryResponse {
        player: player.into(),
        matches: stats.into_iter().map(|s| s.into()).collect(),
    };

    Ok((StatusCode::OK, Json(response)))
}

pub async fn get_player_highlights(
    State(state): State<AppState>,
    Path((game_id, player_id)): Path<(Uuid, Uuid)>,
    user: AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let stats = state
        .stats_service
        .get_player_highlights(&state, user.id, game_id, player_id)
        .await?;

    let response: PlayerHighlightsResponse = stats.into();

    Ok((StatusCode::OK, Json(response)))
}

pub async fn get_distributions(
    State(state): State<AppState>,
    Path(game_id): Path<Uuid>,
    user: AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let distribution = state
        .stats_service
        .get_distributions(&state, user.id, game_id)
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
