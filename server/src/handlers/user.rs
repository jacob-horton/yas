use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};
use tower_sessions::Session;

use crate::{
    AppState,
    constants::SESSION_USER_KEY,
    errors::{AppError, GroupError, UserError},
    extractors::{auth::AuthUser, validated_json::ValidatedJson},
    models::{
        group::GroupResponse,
        user::{CreateUserReq, UserResponse},
    },
    services,
};

// Sign up
async fn create_user(
    session: Session,
    State(state): State<AppState>,
    ValidatedJson(payload): ValidatedJson<CreateUserReq>,
) -> Result<impl IntoResponse, AppError> {
    let hash = services::auth::hash_password(&payload.password)?;

    let user = state
        .user_repo
        .create(&state.pool, &payload.name, &payload.email, &hash)
        .await
        .map_err(|_| UserError::UserAlreadyExists)?;

    // Create session (sets the cookie automatically)
    session
        .insert(SESSION_USER_KEY, user.id.to_string())
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    let response: UserResponse = user.into();
    Ok((StatusCode::CREATED, Json(response)))
}

async fn get_current_user(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let user = state
        .user_repo
        .find_by_id(&state.pool, user.id)
        .await
        .map_err(UserError::Database)?
        .ok_or(UserError::NotFound)?;

    let response: UserResponse = user.into();
    Ok((StatusCode::OK, Json(response)))
}

async fn get_current_user_groups(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let groups = state
        .group_repo
        .get_user_groups(&state.pool, user.id)
        .await
        .map_err(GroupError::Database)?;

    let response: Vec<GroupResponse> = groups.into_iter().map(|g| g.into()).collect();
    Ok((StatusCode::OK, Json(response)))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/users", post(create_user))
        .route("/users/me", get(get_current_user))
        .route("/users/me/groups", get(get_current_user_groups))
}
