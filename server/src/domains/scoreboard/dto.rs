use serde::Serialize;

use crate::domains::group::dto::Group;

use super::model::DbScoreboard;

#[derive(Debug, Clone, Serialize)]
pub struct Scoreboard {
    pub id: i32,
    pub name: String,
    pub players_per_game: i32,
}

impl From<DbScoreboard> for Scoreboard {
    fn from(value: DbScoreboard) -> Self {
        Self {
            id: value.id,
            name: value.name,
            players_per_game: value.players_per_game,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct GroupScoreboards {
    pub group: Group,
    pub scoreboards: Vec<Scoreboard>,
}

#[derive(Debug, Clone, Serialize)]
pub struct Score {
    pub name: String,
    pub win_percent: i32,
    pub points_per_game: f64,
}

#[derive(Debug, Clone, Serialize)]
pub struct ScoreboardResponse {
    pub name: String,
    pub scores: Vec<Score>,
}
