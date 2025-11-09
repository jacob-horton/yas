use std::collections::HashMap;

use actix_web::{HttpResponse, Responder, get, web};

use crate::{
    db::postgres::DbPool,
    domains::{
        group::{dto::Group, repository::get_user_groups},
        scoreboard::{
            dto::{GroupScoreboards, Scoreboard},
            repository::get_user_scoreboards,
        },
    },
    middleware::auth::AuthedUser,
};

// TODO: rename this to "scoreboards_by_group"?
#[get("/me/scoreboards")]
async fn get_scoreboards(user: AuthedUser, pool: web::Data<DbPool>) -> impl Responder {
    let client = pool
        .get()
        .await
        .expect("Failed to retrieve database connection from pool");

    let groups = get_user_groups(&client, user.id)
        .await
        .expect("Failed to read groups from database");

    let scoreboards = get_user_scoreboards(&client, user.id)
        .await
        .expect("Failed to read scoreboards from database");

    let mut scoreboards_by_group: HashMap<i32, Vec<Scoreboard>> = HashMap::new();

    // Group scoreboards
    for scoreboard in scoreboards {
        scoreboards_by_group
            .entry(scoreboard.group_id)
            .or_insert(Vec::new())
            .push(Scoreboard::from(scoreboard));
    }

    let grouped_scoreboards: Vec<GroupScoreboards> = scoreboards_by_group
        .iter()
        .map(|(group_id, scoreboards)| GroupScoreboards {
            group: Group::from(groups.iter().find(|g| g.id == *group_id).unwrap().clone()),
            scoreboards: scoreboards.clone(),
        })
        .collect();

    HttpResponse::Ok().json(grouped_scoreboards)
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(get_scoreboards);
}
