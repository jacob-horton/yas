use crate::domains::group::dto::ScoresResponse;
use crate::middleware::auth::AuthedUser;
use crate::{db::postgres::DbPool, domains::group::repository::get_scores};
use actix_web::{HttpResponse, Responder, get, web};

#[get("/group/scores")]
async fn scores(user: AuthedUser, pool: web::Data<DbPool>) -> impl Responder {
    let client = pool.get().await.unwrap();
    let scores = get_scores(&client).await.unwrap();

    HttpResponse::Ok().json(ScoresResponse {
        scores: scores.into_iter().map(|s| s.into()).collect(),
    })
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(scores);
}
