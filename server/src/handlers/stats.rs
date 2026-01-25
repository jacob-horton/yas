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
    models::stats::{PlayerMatchResponse, StatsParams},
    services,
};

pub async fn get_user_stats(
    State(state): State<AppState>,
    Path((game_id, player_id)): Path<(String, String)>,
    Query(query): Query<StatsParams>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let game_id = game_id
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid game ID".to_string()))?;

    let player_id = player_id
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid player ID".to_string()))?;

    let stats = services::stats::get_player_stats(
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

pub fn router() -> Router<AppState> {
    Router::new().route("/games/:gameId/player-stats/:playerId", get(get_user_stats))
}
