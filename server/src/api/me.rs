use actix_web::{HttpResponse, Responder, get};

use crate::{middleware::auth::AuthedUser, store::user::get_user};

#[get("/me")]
pub async fn get_me(user: AuthedUser) -> impl Responder {
    let user = get_user(user.id).await.unwrap();
    return HttpResponse::Ok().json(user);
}
