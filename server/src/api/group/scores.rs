use actix_web::{HttpResponse, Responder, get};

use crate::{middleware::auth::AuthedUser, store::group::get_data};

#[get("/group/scores")]
pub async fn get_scores(_: AuthedUser) -> impl Responder {
    let scores = get_data().await.unwrap();
    HttpResponse::Ok().json(scores)
}
