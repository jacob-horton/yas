use serde::Serialize;

use super::model::DbScore;

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
