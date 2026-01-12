use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::post,
};

use crate::{
    AppState,
    errors::AppError,
    extractors::{auth::AuthUser, validated_json::ValidatedJson},
    models::game::{CreateGameReq, GameResponse},
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

pub fn router() -> Router<AppState> {
    Router::new().route("/groups/:id/games", post(create_game))
}
