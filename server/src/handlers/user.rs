use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, patch, post, put},
};
use tower_sessions::Session;
use uuid::Uuid;

use crate::{
    AppState,
    constants::SESSION_USER_KEY,
    errors::{AppError, GroupError, UserError},
    extractors::{auth::AuthUser, validated_json::ValidatedJson},
    models::{
        group::GroupResponse,
        user::{
            CreateUserReq, PublicUserDetailsResponse, UpdatePasswordReq, UpdateUserReq,
            UserResponse,
        },
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
        .find_by_id(&state.pool, &user.id)
        .await
        .map_err(UserError::Database)?
        .ok_or(UserError::NotFound)?;

    let response: UserResponse = user.into();
    Ok((StatusCode::OK, Json(response)))
}

// Gets public info about a user
async fn get_user(
    State(state): State<AppState>,
    AuthUser(logged_in_user): AuthUser,
    Path(user_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    // Check if logged in user shares a group with lookup user for privacy
    let shares_group = state
        .group_repo
        .users_share_group(&state.pool, logged_in_user.id, user_id)
        .await?;

    if !shares_group {
        return Err(UserError::NotPermittedToView.into());
    }

    let user = state
        .user_repo
        .find_by_id(&state.pool, &user_id)
        .await
        .map_err(UserError::Database)?
        .ok_or(UserError::NotFound)?;

    let response: PublicUserDetailsResponse = user.into();
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

async fn update_current_user(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    ValidatedJson(payload): ValidatedJson<UpdateUserReq>,
) -> Result<impl IntoResponse, AppError> {
    let user = state
        .user_repo
        .update(
            &state.pool,
            user.id,
            &payload.name,
            &payload.email,
            payload.avatar,
            payload.avatar_colour,
        )
        .await
        .map_err(UserError::Database)?;

    let response: UserResponse = user.into();
    Ok((StatusCode::OK, Json(response)))
}

async fn update_password(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    ValidatedJson(payload): ValidatedJson<UpdatePasswordReq>,
) -> Result<impl IntoResponse, AppError> {
    services::user::update_password(
        &state,
        &user.id,
        &payload.current_password,
        &payload.new_password,
    )
    .await?;

    Ok(StatusCode::NO_CONTENT)
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/users", post(create_user))
        .route("/users/me", get(get_current_user))
        .route("/users/me", patch(update_current_user))
        .route("/users/me/password", put(update_password))
        .route("/users/me/groups", get(get_current_user_groups))
        .route("/users/:id", get(get_user))
}
