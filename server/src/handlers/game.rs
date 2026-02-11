use axum::{
    Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};
use uuid::Uuid;

use crate::{
    AppState,
    errors::AppError,
    extractors::{auth::AuthUser, validated_json::ValidatedJson},
    models::{
        game::{CreateGameReq, GameResponse},
        stats::{ScoreboardResponse, StatsParams},
    },
    services,
};

pub async fn create_game(
    State(state): State<AppState>,
    Path(group_id): Path<Uuid>,
    AuthUser(user): AuthUser,
    ValidatedJson(payload): ValidatedJson<CreateGameReq>,
) -> Result<impl IntoResponse, AppError> {
    let game = services::game::create_game(&state, user.id, group_id, payload).await?;

    let response: GameResponse = game.into();
    Ok((StatusCode::CREATED, Json(response)))
}

pub async fn get_games_in_group(
    State(state): State<AppState>,
    Path(group_id): Path<Uuid>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let games = services::group::get_games_in_group(&state, user.id, group_id).await?;

    let response: Vec<GameResponse> = games.into_iter().map(|g| g.into()).collect();
    Ok((StatusCode::CREATED, Json(response)))
}

pub async fn get_scoreboard(
    State(state): State<AppState>,
    Path(game_id): Path<Uuid>,
    Query(query): Query<StatsParams>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let scoreboard = services::stats::get_scoreboard(
        &state,
        user.id,
        game_id,
        query.num_matches.unwrap_or(10),
        query.order_by,
        query.order_dir,
    )
    .await?;

    let response: ScoreboardResponse = scoreboard.into();

    Ok((StatusCode::OK, Json(response)))
}

pub async fn get_game_details(
    State(state): State<AppState>,
    Path(game_id): Path<Uuid>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let game = services::game::get(&state, user.id, game_id).await?;
    let response: GameResponse = game.into();

    Ok((StatusCode::OK, Json(response)))
}

pub async fn get_last_players(
    State(state): State<AppState>,
    Path(game_id): Path<Uuid>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let players = services::game::get_last_players(&state, user.id, game_id).await?;

    Ok((StatusCode::OK, Json(players)))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/groups/:id/games", post(create_game))
        .route("/groups/:id/games", get(get_games_in_group))
        .route("/games/:id", get(get_game_details))
        .route("/games/:id/scoreboard", get(get_scoreboard))
        .route("/games/:id/last-players", get(get_last_players))
}
