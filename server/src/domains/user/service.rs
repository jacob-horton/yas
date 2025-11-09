use argon2::Argon2;
use password_hash::{PasswordHasher, SaltString};
use rand::rngs::OsRng;
use tokio_postgres::Client;

use super::{
    model::{DbUser, InsertDbUser},
    repository::{DbError, create},
};

#[derive(Debug, Clone)]
pub enum CreateUserError {
    EmailAlreadyInUse,
    DbError(DbError),
}

pub async fn create_user(
    client: &Client,
    name: &str,
    email: &str,
    password: &str,
) -> Result<DbUser, CreateUserError> {
    let salt = SaltString::generate(OsRng);
    let password_hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .unwrap();

    create(
        client,
        InsertDbUser {
            name: name.to_string(),
            email: email.to_string(),
            password_hash: password_hash.to_string(),
        },
    )
    .await
    .map_err(|e| match e {
        DbError::DuplicateKey => CreateUserError::EmailAlreadyInUse,
        _ => CreateUserError::DbError(e),
    })
}
