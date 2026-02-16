use uuid::Uuid;

use crate::{
    AppState,
    errors::{AppError, UserError},
    models::user::{CreateUserReq, UserDb},
    services::{self},
};

pub async fn update_password(
    state: &AppState,
    user_id: &Uuid,
    current_password: &str,
    new_password: &str,
) -> Result<(), AppError> {
    let user = state
        .user_repo
        .find_by_id(&state.pool, user_id)
        .await?
        .ok_or(UserError::NotFound)?;

    if !services::auth::verify_password(&user.password_hash, current_password) {
        return Err(UserError::InvalidCurrentPassword.into());
    }

    let hash = services::auth::hash_password(new_password)?;

    state
        .user_repo
        .update_password(&state.pool, user_id, &hash)
        .await
        .map_err(UserError::Database)?;

    Ok(())
}

pub async fn create_user(state: &AppState, payload: CreateUserReq) -> Result<UserDb, AppError> {
    let hash = services::auth::hash_password(&payload.password)?;

    let user = state
        .user_repo
        .create(&state.pool, &payload.name, &payload.email, &hash)
        .await
        .map_err(|_| UserError::UserAlreadyExists)?;

    state
        .email_repo
        .send_invite(&state.pool, &user.email, &user.name)
        .await?;

    Ok(user)
}
