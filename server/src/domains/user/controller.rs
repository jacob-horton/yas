use crate::db::postgres::DbPool;
use crate::domains::user;
use crate::domains::user::dto::MeResponse;
use crate::middleware::auth::AuthedUser;
use actix_web::{HttpResponse, Responder, get, web};

#[get("/me")]
async fn me(user: AuthedUser, pool: web::Data<DbPool>) -> impl Responder {
    let client = pool.get().await.unwrap();
    let full_user = user::repository::find_by_id(&client, user.id)
        .await
        .unwrap();

    HttpResponse::Ok().json(MeResponse {
        id: full_user.id,
        email: full_user.email,
    })
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(me);
}
