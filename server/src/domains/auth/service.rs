use std::time::{Duration, SystemTime, UNIX_EPOCH};

use crate::domains::{
    auth::model::{AccessClaims, RefreshClaims},
    user::repository::find_by_email,
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
    let parsed_hash = PasswordHash::new(password_hash).unwrap();
    Argon2::default()
        .verify_password(password.as_ref(), &parsed_hash)
        .is_ok()
}

pub async fn authenticate_user(client: &Client, email: &str, password: &str) -> Option<Tokens> {
    let user = find_by_email(client, email).await.unwrap();

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
            .unwrap()
            .as_secs() as usize,
    };

    let access_token = encode(
        &jsonwebtoken::Header::default(),
        &access_claims,
        &EncodingKey::from_secret(SIGNING_KEY.as_ref()),
    )
    .unwrap();

    let refresh_claims = RefreshClaims {
        iss: ISSUER.to_string(),
        sub: id.to_string(),
        exp: (SystemTime::now() + REFRESH_EXPIRATION)
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as usize,
        version: session_version,
    };

    let refresh_token = encode(
        &jsonwebtoken::Header::default(),
        &refresh_claims,
        &EncodingKey::from_secret(SIGNING_KEY.as_ref()),
    )
    .unwrap();

    Tokens {
        access_token,
        refresh_token,
    }
}

pub fn parse_token<T: DeserializeOwned>(token: &str) -> T {
    let mut validation = Validation::default();
    validation.set_issuer(&[ISSUER]);

    let token = decode::<T>(
        token,
        &DecodingKey::from_secret(SIGNING_KEY.as_ref()),
        &validation,
    )
    .unwrap();

    token.claims
}
