use std::time::{Duration, SystemTime, UNIX_EPOCH};

use actix_web::{HttpResponse, Responder, cookie::Cookie, get, post, web};
use argon2::{
    Argon2,
    password_hash::{PasswordHasher, SaltString, rand_core::OsRng},
};
use jsonwebtoken::{EncodingKey, encode};
use serde::{Deserialize, Serialize};

use crate::store::user;

#[derive(Deserialize)]
struct LoginDetails {
    email: String,
    password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessClaims {
    pub sub: String,
    exp: usize,
    iss: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RefreshClaims {
    pub sub: String,
    exp: usize,
    iss: String,
    version: usize,
}

#[derive(Debug, Clone)]
pub struct Tokens {
    pub access_token: String,
    pub refresh_token: String,
}

pub static SIGNING_KEY: &str = "secret";
pub static ISSUER: &str = "yas-server";
// pub static ACCESS_EXPIRATION: Duration = Duration::from_secs(5 * 60);
// pub static REFRESH_EXPIRATION: Duration = Duration::from_secs(30 * 24 * 60 * 60);

pub static ACCESS_EXPIRATION: Duration = Duration::from_secs(5);
pub static REFRESH_EXPIRATION: Duration = Duration::from_secs(30 * 24 * 60 * 60);

pub fn generate_tokens(id: i32, session_version: i32) -> Result<Tokens, ()> {
    let access_claims = AccessClaims {
        sub: id.to_string(),
        exp: (SystemTime::now() + ACCESS_EXPIRATION)
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as usize,
        iss: ISSUER.to_string(),
    };

    let access_token = encode(
        &jsonwebtoken::Header::default(),
        &access_claims,
        &EncodingKey::from_secret(SIGNING_KEY.as_ref()),
    )
    .or(Err(()))?;

    let refresh_claims = RefreshClaims {
        sub: id.to_string(),
        exp: (SystemTime::now() + REFRESH_EXPIRATION)
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as usize,
        iss: ISSUER.to_string(),
        version: session_version as usize,
    };

    let refresh_token = encode(
        &jsonwebtoken::Header::default(),
        &refresh_claims,
        &EncodingKey::from_secret(SIGNING_KEY.as_ref()),
    )
    .or(Err(()))?;

    Ok(Tokens {
        access_token,
        refresh_token,
    })
}

#[post("/auth/login")]
pub async fn login(data: web::Json<LoginDetails>) -> impl Responder {
    let (user_id, session_version) = if let Ok(u) = user::login(&data.email, &data.password).await {
        u
    } else {
        // TODO: remove cookie
        return HttpResponse::Unauthorized().finish();
    };

    let tokens = generate_tokens(user_id, session_version).unwrap();

    // TODO: set secure and same site properly for prod
    let access_cookie = Cookie::build("access_token", &tokens.access_token)
        .http_only(true)
        .secure(false)
        .same_site(actix_web::cookie::SameSite::Lax)
        .domain("localhost")
        .path("/")
        .finish();

    let refresh_cookie = Cookie::build("refresh_token", &tokens.refresh_token)
        .http_only(true)
        .secure(false)
        .same_site(actix_web::cookie::SameSite::Lax)
        .domain("localhost")
        .path("/")
        .finish();

    HttpResponse::NoContent()
        .cookie(access_cookie)
        .cookie(refresh_cookie)
        .finish()
}
