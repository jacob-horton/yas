use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::post,
};
use uuid::Uuid;

use crate::{
    AppState,
    errors::AppError,
    extractors::{auth::AuthUser, validated_json::ValidatedJson},
    models::game_match::{CreateMatchReq, MatchResponse},
    services,
};

pub async fn create_match(
    State(state): State<AppState>,
    Path(game_id): Path<Uuid>,
    AuthUser(user): AuthUser,
    ValidatedJson(payload): ValidatedJson<CreateMatchReq>,
) -> Result<impl IntoResponse, AppError> {
    let game_match = services::game_match::create_match(&state, game_id, user.id, payload).await?;

    let response: MatchResponse = game_match.into();
    Ok((StatusCode::CREATED, Json(response)))
}

pub fn router() -> Router<AppState> {
    Router::new().route("/games/:id/matches", post(create_match))
}
