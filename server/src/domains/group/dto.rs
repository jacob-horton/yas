use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::model::{DbGroup, DbScore};

#[derive(Debug, Clone, Serialize)]
pub struct Score {
    pub name: String,
    pub win_percent: i32,
    pub points_per_game: f64,
}

#[derive(Debug, Clone, Serialize)]
pub struct ScoresResponse {
    pub scores: Vec<Score>,
}

impl From<DbScore> for Score {
    fn from(value: DbScore) -> Self {
        Self {
            name: value.name,
            win_percent: value.win_percent,
            points_per_game: value.points_per_game,
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateGroupRequest {
    pub name: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Group {
    pub id: i32,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

impl From<DbGroup> for Group {
    fn from(value: DbGroup) -> Self {
        Self {
            id: value.id,
            name: value.name,
            created_at: value.created_at,
        }
    }
}
