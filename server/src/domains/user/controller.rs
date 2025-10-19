use crate::domains::user;
use crate::domains::user::dto::MeResponse;
use crate::middleware::auth::AuthedUser;
use crate::{db::postgres::DbPool, middleware::errors::StatusError};
use actix_web::http::StatusCode;
use actix_web::{HttpResponse, Responder, get, web};

use super::repository::DbError;

#[get("/me")]
async fn me(user: AuthedUser, pool: web::Data<DbPool>) -> impl Responder {
    let client = pool
        .get()
        .await
        .expect("Failed to retrieve database connection from pool");

    let full_user = match user::repository::find_by_id(&client, user.id).await {
        Ok(u) => u,
        Err(DbError::NoRows) => {
            return Err(StatusError::new(
                "Failed to find user",
                StatusCode::NOT_FOUND,
            ));
        }
        Err(e) => panic!("Failed to find user by ID: {e:?}"),
    };

    Ok(HttpResponse::Ok().json(MeResponse {
        id: full_user.id,
        name: full_user.name,
        email: full_user.email,
    }))
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(me);
}
