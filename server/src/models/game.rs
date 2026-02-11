use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, prelude::Type};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, FromRow)]
pub struct GameDb {
    pub id: Uuid,
    pub group_id: Uuid,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub players_per_match: i32,
    pub metric: ScoringMetric,
}

#[derive(Debug, Serialize)]
pub struct GameResponse {
    pub id: Uuid,
    pub name: String,
    pub group_id: Uuid,
    pub created_at: String,
    pub players_per_match: i32,
    pub metric: ScoringMetric,
}

impl From<GameDb> for GameResponse {
    fn from(game: GameDb) -> Self {
        Self {
            id: game.id,
            group_id: game.group_id,
            name: game.name,
            created_at: game.created_at.to_rfc3339(),
            players_per_match: game.players_per_match,
            metric: game.metric,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Type, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
#[sqlx(type_name = "scoring_metric", rename_all = "snake_case")]
pub enum ScoringMetric {
    WinRate,
    AverageScore,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateGameReq {
    #[validate(length(min = 3, max = 50, message = "Name must be between 3 and 50 chars"))]
    pub name: String,

    #[validate(range(
        min = 2,
        max = 50,
        message = "Number of players per match must be between 2 and 50"
    ))]
    pub players_per_match: i32,

    pub metric: ScoringMetric,
}
