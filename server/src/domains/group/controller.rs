use crate::db::postgres::DbPool;
use crate::domains::group::dto::{CreateGroupRequest, Group, Player};
use crate::domains::group::repository::{self, MemberType, add_user_to_group, get_user_groups};
use crate::middleware::auth::AuthedUser;
use actix_web::{HttpResponse, Responder, get, post, web};

#[get("/me/groups")]
async fn get_groups(user: AuthedUser, pool: web::Data<DbPool>) -> impl Responder {
    let client = pool
        .get()
        .await
        .expect("Failed to retrieve database connection from pool");

    let groups = get_user_groups(&client, user.id)
        .await
        .expect("Failed to read groups from database");

    HttpResponse::Ok().json(
        groups
            .into_iter()
            .map(|g| Group::from(g))
            .collect::<Vec<_>>(),
    )
}

#[post("/groups")]
async fn create_group(
    req: web::Json<CreateGroupRequest>,
    user: AuthedUser,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let client = pool
        .get()
        .await
        .expect("Failed to retrieve database connection from pool");

    let group = repository::create_group(&client, &req.name)
        .await
        .expect("Failed to create group");

    // TODO: what to do if this fails
    add_user_to_group(&client, group.id, user.id, MemberType::Owner)
        .await
        .unwrap();
    let group: Group = group.into();

    HttpResponse::Ok().json(group)
}

#[get("/group/{id}/members")]
async fn get_members(
    path: web::Path<i32>,
    _: AuthedUser,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let client = pool
        .get()
        .await
        .expect("Failed to retrieve database connection from pool");

    let players = repository::get_members(&client, path.into_inner())
        .await
        .expect("Failed to get members");

    HttpResponse::Ok().json(
        players
            .into_iter()
            .map(|p| Player::from(p))
            .collect::<Vec<_>>(),
    )
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(get_groups)
        .service(create_group)
        .service(get_members);
}
