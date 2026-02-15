use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

use crate::models::{
    game::{GameDb, GameResponse, OrderBy},
    user::{Avatar, AvatarColour},
};

#[derive(sqlx::FromRow, Debug)]
pub struct RawMatchStats {
    pub user_id: Uuid,
    pub name: String,
    pub avatar: Avatar,
    pub avatar_colour: AvatarColour,
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
    pub match_id: Uuid,
    pub score: i32,
    pub played_at: DateTime<Utc>,
    pub rank_in_match: i64,
}

impl From<PlayerMatchDb> for PlayerMatchResponse {
    fn from(stats: PlayerMatchDb) -> Self {
        Self {
            match_id: stats.match_id,
            score: stats.score,
            played_at: stats.played_at,
            rank_in_match: stats.rank_in_match,
        }
    }
}

#[derive(Debug, Clone)]
pub struct ScoreboardEntry {
    pub user_id: Uuid,
    pub user_name: String,
    pub user_avatar: Avatar,
    pub user_avatar_colour: AvatarColour,
    pub matches_played: i64,
    pub average_score: f64,
    pub best_score: i32,
    pub wins: i64,
    pub win_rate: f64,

    pub rank: i32,

    pub rank_diff: i32,
    pub average_score_diff: f64,
    pub win_rate_diff: f64,
}

#[derive(Deserialize)]
pub struct StatsParams {
    pub order_by: Option<OrderBy>,
    pub order_dir: Option<OrderDir>,
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum OrderDir {
    Ascending,
    Descending,
}

impl OrderDir {
    pub fn reverse(&self) -> Self {
        match self {
            Self::Ascending => Self::Descending,
            Self::Descending => Self::Ascending,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Scoreboard {
    pub entries: Vec<ScoreboardEntry>,
    pub podium: Vec<ScoreboardEntry>,
    pub highlights: HighlightsResponse,
    pub game: GameDb,
}

#[derive(Serialize)]
pub struct ScoreboardResponse {
    pub entries: Vec<ScoreboardEntryResponse>,
    pub podium: Vec<ScoreboardEntryResponse>,
    pub highlights: HighlightsResponse,
    pub game: GameResponse,
}

#[derive(Serialize)]
pub struct ScoreboardEntryResponse {
    pub rank: i32,
    pub user_id: Uuid,
    pub user_name: String,
    pub user_avatar: Avatar,
    pub user_avatar_colour: AvatarColour,
    pub matches_played: i64,
    pub average_score: f64,
    pub wins: i64,
    pub win_rate: f64,

    pub rank_diff: i32,
    pub average_score_diff: f64,
    pub win_rate_diff: f64,
}

impl From<ScoreboardEntry> for ScoreboardEntryResponse {
    fn from(entry: ScoreboardEntry) -> Self {
        Self {
            rank: entry.rank,
            user_id: entry.user_id,
            user_name: entry.user_name,
            user_avatar: entry.user_avatar,
            user_avatar_colour: entry.user_avatar_colour,
            matches_played: entry.matches_played,
            average_score: entry.average_score,
            wins: entry.wins,
            win_rate: entry.win_rate,

            rank_diff: entry.rank_diff,
            average_score_diff: entry.average_score_diff,
            win_rate_diff: entry.win_rate_diff,
        }
    }
}

impl From<Scoreboard> for ScoreboardResponse {
    fn from(scoreboard: Scoreboard) -> Self {
        Self {
            entries: scoreboard.entries.into_iter().map(|s| s.into()).collect(),
            podium: scoreboard.podium.into_iter().map(|s| s.into()).collect(),
            highlights: scoreboard.highlights,
            game: scoreboard.game.into(),
        }
    }
}

#[derive(Debug)]
pub struct PlayerHighlightStats {
    pub lifetime: StatsLifetime,
}

#[derive(Debug, FromRow)]
pub struct StatsLifetime {
    pub average_score: f64,
    pub best_score: i32,
    pub total_games: i64,
    pub win_rate: f64,
    pub rank: i64,
}

#[derive(Serialize)]
pub struct PlayerHighlightsResponse {
    pub lifetime: HighlightsLifetimeResponse,
}

#[derive(Serialize)]
pub struct HighlightsLifetimeResponse {
    pub average_score: f64,
    pub best_score: i32,
    pub total_games: i64,
    pub win_rate: f64,
    pub rank: i64,
}

impl From<StatsLifetime> for HighlightsLifetimeResponse {
    fn from(value: StatsLifetime) -> Self {
        Self {
            average_score: value.average_score,
            best_score: value.best_score,
            total_games: value.total_games,
            win_rate: value.win_rate,
            rank: value.rank,
        }
    }
}

impl From<PlayerHighlightStats> for PlayerHighlightsResponse {
    fn from(value: PlayerHighlightStats) -> Self {
        Self {
            lifetime: value.lifetime.into(),
        }
    }
}

#[derive(sqlx::FromRow)]
pub struct RawHighlight {
    pub user_id: Uuid,
    pub user_name: String,
    pub value: f64,
    pub stat_type: String,
}

#[derive(Serialize, Clone, Debug)]
pub struct HighlightDetail<T> {
    pub user_id: Uuid,
    pub user_name: String,
    pub value: T,
}

// Just used when generating from array or raw highlights
impl<T: Default> Default for HighlightDetail<T> {
    fn default() -> Self {
        Self {
            user_id: Uuid::nil(),
            user_name: String::new(),
            value: T::default(),
        }
    }
}

#[derive(Serialize, Clone, Debug, Default)]
#[serde(rename_all = "snake_case")]
pub struct HighlightsResponse {
    pub highest_win_rate: HighlightDetail<f64>,
    pub highest_average_score: HighlightDetail<f64>,
    pub highest_single_score: HighlightDetail<i32>,
    pub most_games_played: HighlightDetail<u32>,
    // TODO: longest win streak
    // TODO: most consistent
}

impl From<Vec<RawHighlight>> for HighlightsResponse {
    fn from(rows: Vec<RawHighlight>) -> Self {
        // Start with all zeros/defaults
        let mut response = Self::default();

        for row in rows {
            match row.stat_type.as_str() {
                "highest_win_rate" => {
                    response.highest_win_rate = HighlightDetail {
                        user_id: row.user_id,
                        user_name: row.user_name,
                        value: row.value,
                    };
                }
                "highest_average_score" => {
                    response.highest_average_score = HighlightDetail {
                        user_id: row.user_id,
                        user_name: row.user_name,
                        value: row.value,
                    };
                }
                "highest_single_score" => {
                    response.highest_single_score = HighlightDetail {
                        user_id: row.user_id,
                        user_name: row.user_name,
                        value: row.value as i32,
                    };
                }
                "most_games_played" => {
                    response.most_games_played = HighlightDetail {
                        user_id: row.user_id,
                        user_name: row.user_name,
                        value: row.value as u32,
                    };
                }
                _ => panic!("Unknown stat type {}", row.stat_type),
            }
        }

        response
    }
}

#[derive(Serialize, Clone, Debug)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Distribution {
    Gamma { lambda: f64, alpha: f64 },
}

#[derive(Serialize, Clone, Debug)]
pub struct DistributionWithMaxMin {
    pub distribution: Distribution,
    pub min_score: i32,
    pub max_score: i32,
}
