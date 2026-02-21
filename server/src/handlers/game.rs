use axum::{
    Extension, Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    middleware,
    response::IntoResponse,
    routing::{delete, get, post, put},
};
use uuid::Uuid;

use crate::{
    AppState,
    errors::AppError,
    extractors::{
        auth::AuthUser,
        auth_member::AuthMember,
        rate_limiting::ip::{create_ip_limiter, ip_limit_mw},
        validated_json::ValidatedJson,
        verified_member::VerifiedMember,
        verified_user::VerifiedUser,
    },
    models::{
        game::{CreateGameReq, GameResponse, UpdateGameReq},
        stats::{ScoreboardResponse, StatsParams},
    },
    services,
};

async fn create_game(
    VerifiedMember(member): VerifiedMember,
    State(state): State<AppState>,
    ValidatedJson(payload): ValidatedJson<CreateGameReq>,
) -> Result<impl IntoResponse, AppError> {
    let game = services::game::create_game(&state, member, payload).await?;

    let response: GameResponse = game.into();
    Ok((StatusCode::CREATED, Json(response)))
}

async fn update_game(
    State(state): State<AppState>,
    Path(game_id): Path<Uuid>,
    user: VerifiedUser,
    ValidatedJson(payload): ValidatedJson<UpdateGameReq>,
) -> Result<impl IntoResponse, AppError> {
    let game = services::game::update_game(&state, user.id, game_id, payload).await?;

    let response: GameResponse = game.into();
    Ok((StatusCode::CREATED, Json(response)))
}

async fn delete_game(
    State(state): State<AppState>,
    Path(game_id): Path<Uuid>,
    user: VerifiedUser,
) -> Result<impl IntoResponse, AppError> {
    services::game::delete_game(&state, user.id, game_id).await?;

    Ok(StatusCode::NO_CONTENT)
}

async fn get_games_in_group(
    member: AuthMember,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, AppError> {
    let games = services::group::get_games_in_group(&state, member.group_id).await?;

    let response: Vec<GameResponse> = games.into_iter().map(|g| g.into()).collect();
    Ok((StatusCode::CREATED, Json(response)))
}

async fn get_scoreboard(
    State(state): State<AppState>,
    Path(game_id): Path<Uuid>,
    Query(query): Query<StatsParams>,
    user: AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let scoreboard = services::stats::get_scoreboard_and_stats(
        &state,
        user.id,
        game_id,
        query.order_by,
        query.order_dir,
    )
    .await?;

    let response: ScoreboardResponse = scoreboard.into();

    Ok((StatusCode::OK, Json(response)))
}

async fn get_game_details(
    State(state): State<AppState>,
    Path(game_id): Path<Uuid>,
    user: AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let game = services::game::get(&state, user.id, game_id).await?;
    let response: GameResponse = game.into();

    Ok((StatusCode::OK, Json(response)))
}

async fn get_last_players(
    State(state): State<AppState>,
    Path(game_id): Path<Uuid>,
    user: AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let players = services::game::get_last_players(&state, user.id, game_id).await?;

    Ok((StatusCode::OK, Json(players)))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route(
            "/groups/:group_id/games",
            post(create_game)
                .route_layer(middleware::from_fn(ip_limit_mw))
                .route_layer(Extension(create_ip_limiter(5, 60 * 60))),
        )
        .route("/groups/:group_id/games", get(get_games_in_group))
        .route("/games/:game_id", get(get_game_details))
        .route("/games/:game_id", put(update_game))
        .route("/games/:game_id", delete(delete_game))
        .route("/games/:game_id/scoreboard", get(get_scoreboard))
        .route("/games/:game_id/last-players", get(get_last_players))
}
