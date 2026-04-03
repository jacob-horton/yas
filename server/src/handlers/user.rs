use axum::{
    Extension, Json, Router,
    extract::State,
    http::StatusCode,
    middleware,
    response::IntoResponse,
    routing::{get, patch, post, put},
};
use tower_sessions::Session;

use crate::{
    AppState,
    constants::{SESSION_USER_KEY, SESSION_VERSION_KEY},
    errors::{AppError, GroupError, UserError},
    extractors::{
        auth_user::AuthUser,
        rate_limiting::{
            ip::{create_ip_limiter, ip_limit_mw},
            payload::{RateLimitedPayload, create_payload_limiter},
            user_id::{create_user_limiter, user_limit_mw},
        },
        validated_json::ValidatedJson,
    },
    models::{
        group::GroupResponse,
        user::{CreateUserReq, UpdateEmailReq, UpdatePasswordReq, UpdateUserReq, UserResponse},
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

    // Cycle ID to prevent Session Fixation attacks
    session
        .cycle_id()
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    // Create session (sets the cookie automatically)
    session
        .insert(SESSION_USER_KEY, user.id.to_string())
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    // Save session version
    session
        .insert(SESSION_VERSION_KEY, user.session_version)
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    let response: UserResponse = user.into();
    Ok((StatusCode::CREATED, Json(response)))
}

async fn get_current_user(user: AuthUser) -> Result<impl IntoResponse, AppError> {
    let response: UserResponse = user.0.into();
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

async fn resend_verification(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    services::user::resend_verification(&state, user).await?;

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
        .route(
            "/resend-verification",
            post(resend_verification)
                .route_layer(middleware::from_fn(user_limit_mw))
                .route_layer(middleware::from_fn(ip_limit_mw))
                .route_layer(Extension(create_user_limiter(3, 60 * 60)))
                .route_layer(Extension(create_ip_limiter(5, 60 * 60))),
        )
}
