use crate::models::trim_string;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, prelude::Type};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct GameDb {
    pub id: Uuid,
    pub group_id: Uuid,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub min_players_per_match: i32,
    pub max_players_per_match: i32,
    pub metric: ScoringMetric,

    pub star_threshold: Option<i32>,
    pub gold_threshold: Option<i32>,
    pub silver_threshold: Option<i32>,
    pub bronze_threshold: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct GameResponse {
    pub id: Uuid,
    pub name: String,
    pub group_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub min_players_per_match: i32,
    pub max_players_per_match: i32,
    pub metric: ScoringMetric,

    pub star_threshold: Option<i32>,
    pub gold_threshold: Option<i32>,
    pub silver_threshold: Option<i32>,
    pub bronze_threshold: Option<i32>,
}

impl From<GameDb> for GameResponse {
    fn from(game: GameDb) -> Self {
        Self {
            id: game.id,
            group_id: game.group_id,
            name: game.name,
            created_at: game.created_at,
            min_players_per_match: game.min_players_per_match,
            max_players_per_match: game.max_players_per_match,
            metric: game.metric,

            star_threshold: game.star_threshold,
            gold_threshold: game.gold_threshold,
            silver_threshold: game.silver_threshold,
            bronze_threshold: game.bronze_threshold,
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Type, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
#[sqlx(type_name = "scoring_metric", rename_all = "snake_case")]
pub enum ScoringMetric {
    WinRate,
    AverageScore,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Type, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
#[sqlx(type_name = "TEXT", rename_all = "snake_case")]
pub enum OrderBy {
    WinRate,
    AverageScore,
    Name,
}

impl From<ScoringMetric> for OrderBy {
    fn from(value: ScoringMetric) -> Self {
        match value {
            ScoringMetric::WinRate => OrderBy::WinRate,
            ScoringMetric::AverageScore => OrderBy::AverageScore,
        }
    }
}

#[derive(Debug, Deserialize, Validate, Clone, Copy)]
pub struct GameMedals {
    pub star: Option<i32>,
    pub gold: Option<i32>,
    pub silver: Option<i32>,
    pub bronze: Option<i32>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateGameReq {
    #[validate(length(min = 3, max = 50, message = "Name must be between 3 and 50 chars"))]
    #[serde(deserialize_with = "trim_string")]
    pub name: String,

    #[validate(range(
        min = 1,
        max = 50,
        message = "Min number of players per match must be between 1 and 50"
    ))]
    pub min_players_per_match: i32,

    #[validate(range(
        min = 1,
        max = 50,
        message = "Max number of players per match must be between 1 and 50"
    ))]
    pub max_players_per_match: i32,

    pub metric: ScoringMetric,
    pub medal_scores: Option<GameMedals>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateGameReq {
    #[validate(length(min = 3, max = 50, message = "Name must be between 3 and 50 chars"))]
    #[serde(deserialize_with = "trim_string")]
    pub name: String,

    #[validate(range(
        min = 1,
        max = 50,
        message = "Min number of players per match must be between 1 and 50"
    ))]
    pub min_players_per_match: i32,

    #[validate(range(
        min = 1,
        max = 50,
        message = "Max number of players per match must be between 1 and 50"
    ))]
    pub max_players_per_match: i32,

    pub metric: ScoringMetric,
    pub medal_scores: Option<GameMedals>,
}
