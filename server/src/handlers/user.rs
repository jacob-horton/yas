use axum::{
    Extension, Json, Router,
    extract::{Path, State},
    http::StatusCode,
    middleware,
    response::IntoResponse,
    routing::{get, patch, post, put},
};
use tower_sessions::Session;
use uuid::Uuid;

use crate::{
    AppState,
    constants::{SESSION_USER_KEY, SESSION_VERSION_KEY},
    errors::{AppError, GroupError, UserError},
    extractors::{
        auth::AuthUser,
        rate_limiting::{
            ip::{create_ip_limiter, ip_limit_mw},
            payload::{RateLimitedPayload, create_payload_limiter},
            user_id::{create_user_limiter, user_limit_mw},
        },
        validated_json::ValidatedJson,
    },
    models::{
        group::GroupResponse,
        user::{
            CreateUserReq, PublicUserDetailsResponse, UpdateEmailReq, UpdatePasswordReq,
            UpdateUserReq, UserResponse,
        },
    },
    services,
};

// Sign up
async fn create_user(
    session: Session,
    State(state): State<AppState>,
    RateLimitedPayload(ValidatedJson(payload)): RateLimitedPayload<ValidatedJson<CreateUserReq>>,
) -> Result<impl IntoResponse, AppError> {
    let user = services::user::create_user(&state, payload).await?;

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
    user: AuthUser,
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
    logged_in_user: AuthUser,
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
    user: AuthUser,
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
    user: AuthUser,
    ValidatedJson(payload): ValidatedJson<UpdateUserReq>,
) -> Result<impl IntoResponse, AppError> {
    let user = state
        .user_repo
        .update(
            &state.pool,
            user.id,
            &payload.name,
            payload.avatar,
            payload.avatar_colour,
        )
        .await
        .map_err(UserError::Database)?;

    let response: UserResponse = user.into();
    Ok((StatusCode::OK, Json(response)))
}

async fn update_email(
    AuthUser(user): AuthUser,
    State(state): State<AppState>,
    ValidatedJson(payload): ValidatedJson<UpdateEmailReq>,
) -> Result<impl IntoResponse, AppError> {
    let user = services::user::update_email(&state, user, &payload.email).await?;

    let response: UserResponse = user.into();
    Ok((StatusCode::OK, Json(response)))
}

async fn update_password(
    session: Session,
    user: AuthUser,
    State(state): State<AppState>,
    ValidatedJson(payload): ValidatedJson<UpdatePasswordReq>,
) -> Result<impl IntoResponse, AppError> {
    let updated_user = services::user::update_password(
        &state,
        &user.id,
        &payload.current_password,
        &payload.new_password,
    )
    .await?;

    // Session version updated in database - update session cookie so user stays logged in
    session
        .insert(SESSION_VERSION_KEY, updated_user.session_version)
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    Ok(StatusCode::NO_CONTENT)
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route(
            "/users",
            post(create_user)
                .route_layer(middleware::from_fn(ip_limit_mw))
                .route_layer(Extension(create_payload_limiter(3, 60 * 60)))
                .route_layer(Extension(create_ip_limiter(5, 60 * 60))),
        )
        .route("/users/me", get(get_current_user))
        .route("/users/me", patch(update_current_user))
        .route(
            "/users/me/password",
            put(update_password)
                .route_layer(middleware::from_fn(ip_limit_mw))
                .route_layer(middleware::from_fn(user_limit_mw))
                .route_layer(Extension(create_ip_limiter(5, 60 * 60)))
                .route_layer(Extension(create_user_limiter(3, 60 * 60))),
        )
        .route(
            "/users/me/email",
            put(update_email)
                .route_layer(middleware::from_fn(user_limit_mw))
                .route_layer(middleware::from_fn(ip_limit_mw))
                .route_layer(Extension(create_user_limiter(3, 3600)))
                .route_layer(Extension(create_ip_limiter(5, 3600))),
        )
        .route("/users/me/groups", get(get_current_user_groups))
        .route("/users/:id", get(get_user))
}
