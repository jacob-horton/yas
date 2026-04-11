use std::collections::HashMap;

use async_trait::async_trait;
use redis::AsyncCommands;
use serde::{Serialize, de::DeserializeOwned};
use uuid::Uuid;

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
    services::{
        game::fetch_game_guarded,
        stats::{CacheInvalidator, StatsProvider},
    },
};

pub struct RedisCachedStatsProvider<T: StatsProvider> {
    inner: T,
    redis_pool: deadpool_redis::Pool,
    ttl_seconds: u64,
}

pub struct RedisCacheInvalidator {
    pub pool: deadpool_redis::Pool,
}

impl<T: StatsProvider> RedisCachedStatsProvider<T> {
    pub fn new(inner: T, redis_pool: deadpool_redis::Pool, ttl_seconds: u64) -> Self {
        Self {
            inner,
            redis_pool,
            ttl_seconds,
        }
    }

    async fn with_cache<R, Fut>(
        &self,
        game_id: Uuid,
        key_suffix: &str,
        fallback_fut: Fut,
    ) -> Result<R, AppError>
    where
        R: Serialize + DeserializeOwned,
        Fut: Future<Output = Result<R, AppError>>,
    {
        let mut conn = self.redis_pool.get().await.map_err(AppError::Redis)?;

        // Fetch current cache version for this game (defaults to 0)
        let version_key = format!("game:{}:stats_version", game_id);
        let version: u64 = conn.get(&version_key).await.unwrap_or(0);

        // Construct the versioned key
        let cache_key = format!("stats:game:{}:v{}:{}", game_id, version, key_suffix);

        // Try to hit the cache
        if let Ok(Some(cached_data)) = conn.get::<_, Option<String>>(&cache_key).await {
            if let Ok(data) = serde_json::from_str(&cached_data) {
                return Ok(data);
            }
        }

        // Cache Miss: Await the database future
        let data = fallback_fut.await?;

        // Serialize and store
        if let Ok(serialized) = serde_json::to_string(&data) {
            let _: Result<(), _> = conn.set_ex(&cache_key, serialized, self.ttl_seconds).await;
        }

        Ok(data)
    }
}

// NOTE: each of these methods call fetch_game_guarded to ensure the user actually has access to the
// game
#[async_trait]
impl<T: StatsProvider> StatsProvider for RedisCachedStatsProvider<T> {
    async fn get_scoreboard_and_stats(
        &self,
        state: &AppState,
        user_id: Uuid,
        game_id: Uuid,
        order_by: Option<OrderBy>,
        order_dir: Option<OrderDir>,
    ) -> Result<Scoreboard, AppError> {
        let (game, _) = fetch_game_guarded(state, game_id, user_id).await?;

        let order_by_final = order_by.unwrap_or(game.metric.into());
        let order_dir_final = order_dir.unwrap_or(OrderDir::Descending);
        let suffix = format!("scoreboard:{:?}:{:?}", order_by_final, order_dir_final);

        self.with_cache(
            game_id,
            &suffix,
            self.inner
                .get_scoreboard_and_stats(state, user_id, game_id, order_by, order_dir),
        )
        .await
    }

    async fn get_player_history(
        &self,
        state: &AppState,
        user_id: Uuid,
        game_id: Uuid,
        player_id: Uuid,
    ) -> Result<(Vec<PlayerMatchDb>, UserDb), AppError> {
        fetch_game_guarded(state, game_id, user_id).await?;
        let suffix = format!("history:player:{}", player_id);

        self.with_cache(
            game_id,
            &suffix,
            self.inner
                .get_player_history(state, user_id, game_id, player_id),
        )
        .await
    }

    async fn get_player_highlights(
        &self,
        state: &AppState,
        user_id: Uuid,
        game_id: Uuid,
        player_id: Uuid,
    ) -> Result<PlayerHighlightStats, AppError> {
        fetch_game_guarded(state, game_id, user_id).await?;
        let suffix = format!("highlights:player:{}", player_id);

        self.with_cache(
            game_id,
            &suffix,
            self.inner
                .get_player_highlights(state, user_id, game_id, player_id),
        )
        .await
    }

    async fn get_distributions(
        &self,
        state: &AppState,
        user_id: Uuid,
        game_id: Uuid,
    ) -> Result<HashMap<Uuid, DistributionWithMaxMin>, AppError> {
        fetch_game_guarded(state, game_id, user_id).await?;
        self.with_cache(
            game_id,
            "distributions",
            self.inner.get_distributions(state, user_id, game_id),
        )
        .await
    }
}

#[async_trait]
impl CacheInvalidator for RedisCacheInvalidator {
    async fn invalidate_game_stats(&self, game_id: Uuid) -> Result<(), AppError> {
        let mut conn = self.pool.get().await.map_err(AppError::Redis)?;
        let version_key = format!("game:{}:stats_version", game_id);
        let _: () = redis::cmd("INCR")
            .arg(version_key)
            .query_async(&mut conn)
            .await
            .unwrap_or(());
        Ok(())
    }
}
