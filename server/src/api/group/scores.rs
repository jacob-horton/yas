use actix_web::{HttpResponse, Responder, get};

use crate::store::group::get_data;

#[get("/api/group/scores")]
pub async fn get_scores() -> impl Responder {
    let scores = get_data().await.unwrap();
    HttpResponse::Ok().json(scores)
}
