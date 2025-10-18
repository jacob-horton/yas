use crate::domains::auth::model::RefreshClaims;
use crate::domains::auth::service::{authenticate_user, generate_tokens, parse_token};
use crate::domains::user;
use crate::{db::postgres::DbPool, domains::auth::dto::LoginRequest};
use actix_web::cookie::Cookie;
use actix_web::{HttpRequest, HttpResponse, Responder, post, web};

#[post("/auth/login")]
async fn login(req: web::Json<LoginRequest>, pool: web::Data<DbPool>) -> impl Responder {
    let client = pool.get().await.unwrap();
    match authenticate_user(&client, &req.email, &req.password).await {
        Some(tokens) => {
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
        // TODO: proper error message
        None => HttpResponse::Unauthorized().finish(),
    }
}

#[post("/auth/refresh")]
pub async fn refresh(req: HttpRequest, pool: web::Data<DbPool>) -> impl Responder {
    let cookie = req.cookie("refresh_token").unwrap();
    let token = parse_token::<RefreshClaims>(cookie.value());

    let client = pool.get().await.unwrap();
    let full_user = user::repository::find_by_id(&client, token.sub.parse().unwrap())
        .await
        .unwrap();

    let new_tokens = generate_tokens(full_user.id, full_user.session_version);

    // TODO: reduce duplication
    // TODO: set secure and same site properly for prod
    let access_cookie = Cookie::build("access_token", &new_tokens.access_token)
        .http_only(true)
        .secure(false)
        .same_site(actix_web::cookie::SameSite::Lax)
        .domain("localhost")
        .path("/")
        .finish();

    let refresh_cookie = Cookie::build("refresh_token", &new_tokens.refresh_token)
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

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(login).service(refresh);
}
