use actix_web::{HttpResponse, Responder, get, post, web};
use serde::Deserialize;

use crate::{
    db::postgres::DbPool,
    domains::{
        group::{dto::Group, repository::get_user_groups},
        scoreboard::{
            self,
            dto::{GroupScoreboards, Score, Scoreboard, ScoreboardResponse},
            repository::{self, get_user_scoreboards},
        },
        user,
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

#[get("/scoreboards/{id}")]
async fn get_scores(
    path: web::Path<i32>,
    _: AuthedUser,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let client = pool
        .get()
        .await
        .expect("Failed to retrieve database connection from pool");

    let scores = repository::get_scores(&client, path.into_inner())
        .await
        .expect("Failed to read scores from database");

    let users =
        user::repository::bulk_find_by_id(&client, scores.iter().map(|s| s.user_id).collect())
            .await
            .expect("Failed to get users from database");

    HttpResponse::Ok().json(ScoreboardResponse {
        name: "Scoreboardddd".to_string(),
        scores: scores
            .into_iter()
            .map(|s| Score {
                name: users
                    .iter()
                    .find(|u| u.id == s.user_id)
                    .unwrap()
                    .name
                    .clone(),
                win_percent: s.win_percent,
                points_per_game: s.points_per_game,
            })
            .collect(),
    })
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(get_scoreboards)
        .service(create_scoreboard)
        .service(get_scores);
}
