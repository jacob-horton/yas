use argon2::{
    Argon2,
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString, rand_core::OsRng},
};
use sha256::digest;
use uuid::Uuid;

use crate::{
    AppState,
    errors::{AppError, AuthError, UserError},
    models::user::UserDb,
    services,
};

pub fn hash_password(password: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    argon2
        .hash_password(password.as_bytes(), &salt)
        .map(|h| h.to_string())
        .map_err(|_| AppError::InternalServerError("Failed to hash password".to_string()))
}

pub fn verify_password(hash: &str, password: &str) -> bool {
    let parsed_hash = match PasswordHash::new(hash) {
        Ok(h) => h,
        Err(_) => return false,
    };

    Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok()
}

pub async fn verify_email(state: &AppState, token: Uuid) -> Result<(), AppError> {
    let token_hash = digest(token.to_string());

    let mut tx = state.pool.begin().await?;
    let email = state
        .verification_repo
        .delete_token_and_get_email(&mut *tx, &token_hash)
        .await?
        .ok_or(AuthError::InvalidOrExpiredToken)?;

    state.user_repo.mark_verified(&mut *tx, &email).await?;

    tx.commit().await.map_err(AppError::Database)?;

    Ok(())
}

pub async fn forgot_password(state: &AppState, email: String) -> Result<(), AppError> {
    let mut tx = state.pool.begin().await?;
    let user = state.user_repo.find_by_email(&mut *tx, &email).await?;

    // Return OK if user not found so attacker can't do enumeration attack
    let Some(user) = user else {
        return Ok(());
    };

    // Clear out existing password reset tokens
    state
        .password_resets_repo
        .delete_all_tokens_for_user_id(&mut *tx, &user.id)
        .await
        .map_err(AppError::Database)?;

    let token = Uuid::new_v4();
    let token_hash = digest(token.to_string());

    // Create a new reset token
    state
        .password_resets_repo
        .create_reset_record(&mut *tx, &user.id, &token_hash)
        .await?;

    tx.commit().await?;

    // Send the email
    state
        .email_service
        .send_password_reset_email(&email, token)
        .await?;

    Ok(())
}

pub async fn reset_password(
    state: &AppState,
    token: Uuid,
    password: String,
) -> Result<UserDb, AppError> {
    let token_hash = digest(token.to_string());

    let mut tx = state.pool.begin().await?;
    let user_id = state
        .password_resets_repo
        .delete_token_and_get_user_id(&mut *tx, &token_hash)
        .await?
        .ok_or(AuthError::InvalidOrExpiredToken)?;

    let password_hash = services::auth::hash_password(&password)?;

    let user = state
        .user_repo
        .update_password(&mut *tx, &user_id, &password_hash)
        .await
        .map_err(UserError::Database)?;

    tx.commit().await?;

    // Send the email
    state
        .email_service
        .send_password_reset_complete_email(&user.email)
        .await?;

    Ok(user)
}
