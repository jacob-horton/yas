use std::collections::HashMap;

use actix_web::{HttpResponse, Responder, get, post, web};
use serde::Deserialize;

use crate::{
    db::postgres::DbPool,
    domains::{
        group::{dto::Group, repository::get_user_groups},
        scoreboard::{
            self,
            dto::{GroupScoreboards, Scoreboard},
            repository::{self, get_user_scoreboards},
        },
    },
    middleware::auth::AuthedUser,
};

#[derive(Debug, Clone, Deserialize)]
pub struct CreateScoreboardRequest {
    pub name: String,
    pub group_id: i32,
    pub players_per_game: i32,
}

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

    // NOTE: this is not the most efficient - using array filtering for each group
    let grouped_scoreboards: Vec<GroupScoreboards> = groups
        .iter()
        .map(|g| GroupScoreboards {
            group: Group::from(g.clone()),
            scoreboards: scoreboards
                .iter()
                .filter_map(|s| {
                    if s.group_id == g.id {
                        Some(Scoreboard::from(s.clone()))
                    } else {
                        None
                    }
                })
                .collect(),
        })
        .collect();

    HttpResponse::Ok().json(grouped_scoreboards)
}

// TODO: in all places, make sure authorisation is checked (not just authentication)
#[post("/scoreboard")]
async fn create_scoreboard(
    req: web::Json<CreateScoreboardRequest>,
    _: AuthedUser,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let client = pool
        .get()
        .await
        .expect("Failed to retrieve database connection from pool");

    let scoreboard =
        scoreboard::repository::create(&client, &req.name, req.players_per_game, req.group_id)
            .await
            .unwrap();

    HttpResponse::Ok().json(Scoreboard::from(scoreboard))
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(get_scoreboards).service(create_scoreboard);
}
