use std::time::{Duration, SystemTime, UNIX_EPOCH};

use crate::domains::{
    auth::model::{AccessClaims, RefreshClaims},
    user::{
        model::InsertDbUser,
        repository::{DbError, create, find_by_email},
    },
};
use argon2::{Argon2, PasswordHash, PasswordVerifier};
use jsonwebtoken::{DecodingKey, EncodingKey, Validation, decode, encode};
use serde::de::DeserializeOwned;
use tokio_postgres::Client;

// TODO: sort these constants
// Should this be in .env or config file or something?
pub const SIGNING_KEY: &str = "secret";
pub const ISSUER: &str = "yas-server";

pub static ACCESS_EXPIRATION: Duration = Duration::from_secs(5);
pub static REFRESH_EXPIRATION: Duration = Duration::from_secs(30 * 24 * 60 * 60);

pub struct Tokens {
    pub access_token: String,
    pub refresh_token: String,
}

fn is_password_valid(password: &str, password_hash: &str) -> bool {
    let parsed_hash = PasswordHash::new(password_hash).expect("Password has was not valid");
    Argon2::default()
        .verify_password(password.as_ref(), &parsed_hash)
        .is_ok()
}

pub async fn authenticate_user(client: &Client, email: &str, password: &str) -> Option<Tokens> {
    let user = match find_by_email(client, email).await {
        Ok(user) => user,
        Err(DbError::NoRows) => return None,
        Err(e) => panic!("Failed to find user by email: {e:?}"),
    };

    if !is_password_valid(password, &user.password_hash) {
        return None;
    }

    Some(generate_tokens(user.id, user.session_version))
}

pub fn generate_tokens(id: i32, session_version: i32) -> Tokens {
    let access_claims = AccessClaims {
        iss: ISSUER.to_string(),
        sub: id.to_string(),
        exp: (SystemTime::now() + ACCESS_EXPIRATION)
            .duration_since(UNIX_EPOCH)
            .expect("Failed to calculate expiration time for access token")
            .as_secs() as usize,
    };

    let access_token = encode(
        &jsonwebtoken::Header::default(),
        &access_claims,
        &EncodingKey::from_secret(SIGNING_KEY.as_ref()),
    )
    .expect("Failed to generate access token");

    let refresh_claims = RefreshClaims {
        iss: ISSUER.to_string(),
        sub: id.to_string(),
        exp: (SystemTime::now() + REFRESH_EXPIRATION)
            .duration_since(UNIX_EPOCH)
            .expect("Failed to calculate expiration time for refresh token")
            .as_secs() as usize,
        version: session_version,
    };

    let refresh_token = encode(
        &jsonwebtoken::Header::default(),
        &refresh_claims,
        &EncodingKey::from_secret(SIGNING_KEY.as_ref()),
    )
    .expect("Failed to generate access token");

    Tokens {
        access_token,
        refresh_token,
    }
}

pub fn parse_token<T: DeserializeOwned>(token: &str) -> Result<T, jsonwebtoken::errors::Error> {
    let mut validation = Validation::default();
    validation.set_issuer(&[ISSUER]);

    let token = decode::<T>(
        token,
        &DecodingKey::from_secret(SIGNING_KEY.as_ref()),
        &validation,
    )?;

    Ok(token.claims)
}
