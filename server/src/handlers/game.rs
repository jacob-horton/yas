use axum::{
    Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};

use crate::{
    AppState,
    errors::AppError,
    extractors::{auth::AuthUser, validated_json::ValidatedJson},
    models::{
        game::{CreateGameReq, GameResponse},
        stats::{OrderBy, ScoreboardEntryResponse, StatsParams},
    },
    services,
};

pub async fn create_game(
    State(state): State<AppState>,
    Path((group_id,)): Path<(String,)>,
    AuthUser(user): AuthUser,
    ValidatedJson(payload): ValidatedJson<CreateGameReq>,
) -> Result<impl IntoResponse, AppError> {
    let group_id = group_id
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid group ID".to_string()))?;

    let game = services::game::create_game(&state, user.id, group_id, payload).await?;

    let response: GameResponse = game.into();
    Ok((StatusCode::CREATED, Json(response)))
}

pub async fn get_scoreboard(
    State(state): State<AppState>,
    Path((game_id,)): Path<(String,)>,
    Query(query): Query<StatsParams>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let game_id = game_id
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid group ID".to_string()))?;

    let stats = services::stats::get_stats(
        &state,
        user.id,
        game_id,
        query.num_matches.unwrap_or(10),
        query.order_by.unwrap_or(OrderBy::WinRate),
    )
    .await?;

    let response: Vec<ScoreboardEntryResponse> = stats.into_iter().map(|s| s.into()).collect();
    Ok((StatusCode::CREATED, Json(response)))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/groups/:id/games", post(create_game))
        .route("/games/:id/scoreboard", get(get_scoreboard))
}
