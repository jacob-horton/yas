use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug)]
pub struct MatchDb {
    pub id: Uuid,
    pub game_id: Uuid,
    pub played_at: DateTime<Utc>,
    pub scores: Vec<MatchScoreDb>,
}

#[derive(Debug, FromRow)]
pub struct MatchDetailsDb {
    pub id: Uuid,
    pub game_id: Uuid,
    pub played_at: DateTime<Utc>,
}

#[derive(Debug, FromRow)]
pub struct MatchScoreDb {
    pub user_id: Uuid,
    pub score: i32,
}

#[derive(Debug, Deserialize, Serialize, Validate)]
pub struct CreateMatchReq {
    #[validate(length(min = 1, message = "There must be at least one score"))]
    pub scores: Vec<CreateMatchScoreReq>,
}

#[derive(Debug, Deserialize, Serialize, Validate)]
pub struct CreateMatchScoreReq {
    pub user_id: Uuid,
    pub score: i32,
}

#[derive(Debug, Serialize)]
pub struct MatchResponse {
    pub id: Uuid,
    pub game_id: Uuid,
    pub played_at: DateTime<Utc>,
    pub scores: Vec<MatchScoreResponse>,
}

#[derive(Debug, Serialize)]
pub struct MatchScoreResponse {
    pub user_id: Uuid,
    pub score: i32,
}

impl From<MatchDb> for MatchResponse {
    fn from(game_match: MatchDb) -> Self {
        Self {
            id: game_match.id,
            game_id: game_match.game_id,
            played_at: game_match.played_at,
            scores: game_match
                .scores
                .into_iter()
                .map(|s| MatchScoreResponse {
                    user_id: s.user_id,
                    score: s.score,
                })
                .collect(),
        }
    }
}
