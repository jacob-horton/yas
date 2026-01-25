use serde::{Deserialize, Serialize};
use sqlx::types::Uuid;

use crate::models::game::{GameDb, GameResponse};

#[derive(sqlx::FromRow, Debug)]
pub struct RawMatchStats {
    pub user_id: Uuid,
    pub name: String,
    pub match_id: Uuid,
    pub score: i32,
    pub played_at: chrono::DateTime<chrono::Utc>,
    pub rank_in_match: i64,
}

#[derive(sqlx::FromRow, Debug)]
pub struct PlayerMatchDb {
    pub match_id: Uuid,
    pub score: i32,
    pub played_at: chrono::DateTime<chrono::Utc>,
    pub rank_in_match: i64,
}

#[derive(Debug, Serialize)]
pub struct PlayerMatchResponse {
    pub match_id: String,
    pub score: i32,
    pub played_at: String,
    pub rank_in_match: i64,
}

impl From<PlayerMatchDb> for PlayerMatchResponse {
    fn from(stats: PlayerMatchDb) -> Self {
        Self {
            match_id: stats.match_id.to_string(),
            score: stats.score,
            played_at: stats.played_at.to_rfc3339(),
            rank_in_match: stats.rank_in_match,
        }
    }
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

pub struct Scoreboard {
    pub entries: Vec<ScoreboardEntry>,
    pub game: GameDb,
}

#[derive(Serialize)]
pub struct ScoreboardResponse {
    pub entries: Vec<ScoreboardEntryResponse>,
    pub game: GameResponse,
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

impl From<Scoreboard> for ScoreboardResponse {
    fn from(scoreboard: Scoreboard) -> Self {
        Self {
            entries: scoreboard.entries.into_iter().map(|s| s.into()).collect(),
            game: scoreboard.game.into(),
        }
    }
}
