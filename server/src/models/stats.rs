use serde::{Deserialize, Serialize};
use sqlx::types::Uuid;

#[derive(sqlx::FromRow, Debug)]
pub struct RawMatchStats {
    pub user_id: Uuid,
    pub name: String,
    pub match_id: Uuid,
    pub score: i32,
    pub played_at: chrono::DateTime<chrono::Utc>,
    pub rank_in_match: i64,
}

pub struct ScoreboardEntry {
    pub user_id: Uuid,
    pub user_name: String,
    pub matches_played: i64,
    pub average_score: f64,
    pub wins: i64,
    pub win_rate: f64,
}

#[derive(Deserialize)]
pub struct StatsParams {
    pub order_by: Option<OrderBy>,
    pub num_matches: Option<i32>,
}

#[derive(Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OrderBy {
    WinRate,
    AverageScore,
}

#[derive(Serialize)]
pub struct ScoreboardResponse {
    entries: Vec<ScoreboardEntryResponse>,
}

#[derive(Serialize)]
pub struct ScoreboardEntryResponse {
    pub user_id: String,
    pub user_name: String,
    pub matches_played: i64,
    pub average_score: f64,
    pub wins: i64,
    pub win_rate: f64,
}

impl From<ScoreboardEntry> for ScoreboardEntryResponse {
    fn from(entry: ScoreboardEntry) -> Self {
        Self {
            user_id: entry.user_id.to_string(),
            user_name: entry.user_name,
            matches_played: entry.matches_played,
            average_score: entry.average_score,
            wins: entry.wins,
            win_rate: entry.win_rate,
        }
    }
}
