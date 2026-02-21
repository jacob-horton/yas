use uuid::Uuid;

use crate::{
    AppState,
    errors::{AppError, UserError},
    models::user::{CreateUserReq, UpdateEmailReq, UserDb},
    services::{self},
};

pub async fn update_password(
    state: &AppState,
    user_id: &Uuid,
    current_password: &str,
    new_password: &str,
) -> Result<UserDb, AppError> {
    let user = state
        .user_repo
        .find_by_id(&state.pool, user_id)
        .await?
        .ok_or(UserError::NotFound)?;

    if !services::auth::verify_password(&user.password_hash, current_password) {
        return Err(UserError::InvalidCurrentPassword.into());
    }

    let hash = services::auth::hash_password(new_password)?;

    let updated_user = state
        .user_repo
        .update_password(&state.pool, user_id, &hash)
        .await
        .map_err(UserError::Database)?;

    Ok(updated_user)
}

pub async fn create_user(state: &AppState, payload: CreateUserReq) -> Result<UserDb, AppError> {
    let hash = services::auth::hash_password(&payload.password)?;
    let mut tx = state.pool.begin().await?;

    let user = state
        .user_repo
        .create(&mut *tx, &payload.name, &payload.email, &hash)
        .await
        .map_err(|_| UserError::UserAlreadyExists)?;

    let token = state
        .email_repo
        .create_verification_record(&mut *tx, &user.email)
        .await
        .map_err(AppError::Database)?;

    tx.commit().await?;

    state
        .email_repo
        .send_verification_email(&user.email, &user.name, token)
        .await?;

    Ok(user)
}

pub async fn update_email(
    state: &AppState,
    user: UserDb,
    new_email: &str,
) -> Result<UserDb, AppError> {
    let mut tx = state.pool.begin().await?;

    // Clear out existing verification tokens
    state
        .email_repo
        .delete_all_tokens_for_email(&mut *tx, &user.email)
        .await
        .map_err(AppError::Database)?;

    // Update email and reset "email_verified" to false
    let user = state
        .user_repo
        .update_email(&mut *tx, user.id, new_email)
        .await
        .map_err(UserError::Database)?;

    // Create a new verification token
    let token = state
        .email_repo
        .create_verification_record(&mut *tx, new_email)
        .await?;

    tx.commit().await?;

    // Send the email
    state
        .email_repo
        .send_verification_email(new_email, &user.name, token)
        .await?;

    Ok(user)
}
