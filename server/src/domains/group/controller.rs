use crate::domains::group::dto::ScoresResponse;
use crate::middleware::auth::AuthedUser;
use crate::{db::postgres::DbPool, domains::group::repository::get_scores};
use actix_web::{HttpResponse, Responder, get, web};

#[get("/group/scores")]
async fn scores(_: AuthedUser, pool: web::Data<DbPool>) -> impl Responder {
    let client = pool
        .get()
        .await
        .expect("Failed to retrieve database connection from pool");

    let scores = get_scores(&client)
        .await
        .expect("Failed to read scores from database");

    HttpResponse::Ok().json(ScoresResponse {
        scores: scores.into_iter().map(|s| s.into()).collect(),
    })
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(scores);
}
