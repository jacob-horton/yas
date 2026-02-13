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
    models::stats::{PlayerHighlightsResponse, PlayerMatchResponse},
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

pub async fn get_player_highlights(
    State(state): State<AppState>,
    Path((game_id, player_id)): Path<(Uuid, Uuid)>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let stats = services::stats::get_player_highlights(&state, user.id, game_id, player_id).await?;

    let response: PlayerHighlightsResponse = stats.into();

    Ok((StatusCode::OK, Json(response)))
}

pub async fn get_distributions(
    State(state): State<AppState>,
    Path(game_id): Path<Uuid>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let distribution = services::stats::get_distributions(&state, user.id, game_id).await?;

    Ok((StatusCode::OK, Json(distribution)))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route(
            "/games/:gameId/players/:playerId/history",
            get(get_user_history),
        )
        .route(
            "/games/:gameId/players/:playerId/highlights",
            get(get_player_highlights),
        )
        .route("/games/:gameId/distributions", get(get_distributions))
}
