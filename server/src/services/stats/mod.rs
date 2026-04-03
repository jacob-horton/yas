pub mod cache;
pub mod db;
mod logic;

use crate::{
    AppState,
    errors::AppError,
    models::{
        game::OrderBy,
        stats::{
            DistributionWithMaxMin, OrderDir, PlayerHighlightStats, PlayerMatchDb, Scoreboard,
        },
        user::UserDb,
    },
};
use async_trait::async_trait;
use std::collections::HashMap;
use uuid::Uuid;

#[async_trait]
pub trait StatsProvider: Send + Sync {
    async fn get_scoreboard_and_stats(
        &self,
        state: &AppState,
        user_id: Uuid,
        game_id: Uuid,
        order_by: Option<OrderBy>,
        order_dir: Option<OrderDir>,
    ) -> Result<Scoreboard, AppError>;

    async fn get_player_history(
        &self,
        state: &AppState,
        user_id: Uuid,
        game_id: Uuid,
        player_id: Uuid,
    ) -> Result<(Vec<PlayerMatchDb>, UserDb), AppError>;

    async fn get_player_highlights(
        &self,
        state: &AppState,
        user_id: Uuid,
        game_id: Uuid,
        player_id: Uuid,
    ) -> Result<PlayerHighlightStats, AppError>;

    async fn get_distributions(
        &self,
        state: &AppState,
        user_id: Uuid,
        game_id: Uuid,
    ) -> Result<HashMap<Uuid, DistributionWithMaxMin>, AppError>;
}

#[async_trait]
pub trait CacheInvalidator: Send + Sync {
    async fn invalidate_game_stats(&self, game_id: Uuid) -> Result<(), AppError>;
}
