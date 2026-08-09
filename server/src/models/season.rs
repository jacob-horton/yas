use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

#[derive(Clone, Debug, FromRow, Serialize, Deserialize)]
pub struct SeasonDb {
    pub id: Uuid,
    pub game_id: Uuid,
    pub number: i32,
    pub name: Option<String>,
    pub start_date: DateTime<Utc>,
    pub end_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize)]
pub struct SeasonResponse {
    pub id: Uuid,
    pub game_id: Uuid,
    pub number: i32,
    pub name: Option<String>,
    pub start_date: DateTime<Utc>,
    pub end_date: Option<DateTime<Utc>>,
}

impl From<SeasonDb> for SeasonResponse {
    fn from(season: SeasonDb) -> Self {
        Self {
            id: season.id,
            game_id: season.game_id,
            number: season.number,
            name: season.name,
            start_date: season.start_date,
            end_date: season.end_date,
        }
    }
}
