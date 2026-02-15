use uuid::Uuid;

use crate::{
    AppState,
    errors::{AppError, AuthError, UserError},
    services::{self, auth},
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

    let hash = services::auth::hash_password(&new_password)?;

    state
        .user_repo
        .update_password(&state.pool, user_id, &hash)
        .await
        .map_err(UserError::Database)?;

    Ok(())
}
