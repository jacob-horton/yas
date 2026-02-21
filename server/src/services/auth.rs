use argon2::{
    Argon2,
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString, rand_core::OsRng},
};
use uuid::Uuid;

use crate::{
    AppState,
    errors::{AppError, AuthError},
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
    let mut tx = state.pool.begin().await?;

    let email = state
        .verification_repo
        .delete_token_and_get_email(&mut *tx, token)
        .await?
        .ok_or(AuthError::InvalidOrExpiredToken)?;

    state.user_repo.mark_verified(&mut *tx, &email).await?;

    tx.commit().await.map_err(AppError::Database)?;

    Ok(())
}
