use actix_web::{HttpRequest, HttpResponse, Responder, cookie::Cookie, http::StatusCode, post};
use jsonwebtoken::{DecodingKey, Validation, decode};

use crate::{
    api::auth::login::{ISSUER, RefreshClaims, SIGNING_KEY, generate_tokens},
    middleware::errors::StatusError,
    store::user,
};

#[post("/auth/refresh")]
pub async fn refresh(req: HttpRequest) -> impl Responder {
    let cookie = req.cookie("refresh_token");
    if cookie.is_none() {
        return Err(StatusError::new(
            "No access token",
            StatusCode::UNAUTHORIZED,
        ));
    }

    let refresh_token = cookie.unwrap();

    let mut validation = Validation::default();
    validation.set_issuer(&[ISSUER]);

    let token = decode::<RefreshClaims>(
        &refresh_token.value(),
        &DecodingKey::from_secret(SIGNING_KEY.as_ref()),
        &validation,
    );

    if token.is_err() {
        return Err(StatusError::new(
            "No refresh token",
            StatusCode::UNAUTHORIZED,
        ));
    }

    let token = token.unwrap();
    let user = if let Ok(u) = user::get_user(token.claims.sub.parse().unwrap()).await {
        u
    } else {
        // TODO: remove cookie
        return Err(StatusError::new(
            "Invalid refresh token",
            StatusCode::UNAUTHORIZED,
        ));
    };

    let tokens = generate_tokens(user.id, user.session_version).unwrap();

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

    Ok(HttpResponse::NoContent()
        .cookie(access_cookie)
        .cookie(refresh_cookie)
        .finish())
}
