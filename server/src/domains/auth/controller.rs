use crate::domains::auth::model::RefreshClaims;
use crate::domains::auth::service::{authenticate_user, generate_tokens, parse_token};
use crate::domains::user;
use crate::domains::user::repository::DbError;
use crate::middleware::errors::StatusError;
use crate::{db::postgres::DbPool, domains::auth::dto::LoginRequest};
use actix_web::cookie::Cookie;
use actix_web::http::StatusCode;
use actix_web::{HttpRequest, HttpResponse, Responder, post, web};

pub const ACCESS_COOKIE_NAME: &str = "access_token";
pub const REFRESH_COOKIE_NAME: &str = "refresh_token";

// TODO: set cookie expiry
#[post("/auth/login")]
async fn login(req: web::Json<LoginRequest>, pool: web::Data<DbPool>) -> impl Responder {
    let client = pool
        .get()
        .await
        .expect("Failed to retrieve database connection from pool");

    match authenticate_user(&client, &req.email, &req.password).await {
        Some(tokens) => {
            // TODO: set secure and same site properly for prod
            let access_cookie = Cookie::build(ACCESS_COOKIE_NAME, &tokens.access_token)
                .http_only(true)
                .secure(false)
                .same_site(actix_web::cookie::SameSite::Lax)
                .domain("localhost")
                .path("/")
                .finish();

            let refresh_cookie = Cookie::build(REFRESH_COOKIE_NAME, &tokens.refresh_token)
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
        None => Err(StatusError::new(
            "Incorrect credentials",
            StatusCode::UNAUTHORIZED,
        )),
    }
}

#[post("/auth/logout")]
async fn logout() -> impl Responder {
    // TODO: reduce duplication
    // Unset both cookies
    let mut access_cookie = Cookie::build(ACCESS_COOKIE_NAME, "")
        .http_only(true)
        .secure(false)
        .same_site(actix_web::cookie::SameSite::Lax)
        .domain("localhost")
        .path("/")
        .finish();
    access_cookie.make_removal();

    let mut refresh_cookie = Cookie::build(REFRESH_COOKIE_NAME, "")
        .http_only(true)
        .secure(false)
        .same_site(actix_web::cookie::SameSite::Lax)
        .domain("localhost")
        .path("/")
        .finish();
    refresh_cookie.make_removal();

    HttpResponse::NoContent()
        .cookie(access_cookie)
        .cookie(refresh_cookie)
        .finish()
}

#[post("/auth/refresh")]
pub async fn refresh(req: HttpRequest, pool: web::Data<DbPool>) -> impl Responder {
    let cookie = req.cookie(REFRESH_COOKIE_NAME).ok_or(StatusError::new(
        "No refresh token found",
        StatusCode::UNAUTHORIZED,
    ))?;

    let token = parse_token::<RefreshClaims>(cookie.value())
        .map_err(|_| StatusError::new("Invalid refresh token", StatusCode::UNAUTHORIZED))?;

    let client = pool
        .get()
        .await
        .expect("Failed to retrieve database connection from pool");
    let full_user = match user::repository::find_by_id(
        &client,
        token
            .sub
            .parse()
            .expect("Token is valid but ID is not an integer"),
    )
    .await
    {
        Ok(u) => u,
        Err(DbError::NoRows) => {
            return Err(StatusError::new(
                "Failed to find user",
                StatusCode::NOT_FOUND,
            ));
        }
        Err(e) => panic!("Failed to find user by ID: {e:?}"),
    };

    let new_tokens = generate_tokens(full_user.id, full_user.session_version);

    // TODO: reduce duplication
    // TODO: set secure and same site properly for prod
    let access_cookie = Cookie::build(ACCESS_COOKIE_NAME, &new_tokens.access_token)
        .http_only(true)
        .secure(false)
        .same_site(actix_web::cookie::SameSite::Lax)
        .domain("localhost")
        .path("/")
        .finish();

    let refresh_cookie = Cookie::build(REFRESH_COOKIE_NAME, &new_tokens.refresh_token)
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

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(login).service(refresh).service(logout);
}
