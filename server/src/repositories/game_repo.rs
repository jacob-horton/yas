use sqlx::{PgExecutor, Postgres};
use uuid::Uuid;

use crate::models::game::{GameDb, ScoringMetric};

pub struct GameRepo {}

impl GameRepo {
    pub async fn create<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        group_id: Uuid,
        name: &str,
        min_players_per_match: i32,
        max_players_per_match: i32,
        metric: ScoringMetric,
        star_threshold: Option<i32>,
        gold_threshold: Option<i32>,
        silver_threshold: Option<i32>,
        bronze_threshold: Option<i32>,
    ) -> Result<GameDb, sqlx::Error> {
        sqlx::query_as::<_, GameDb>(
            "INSERT INTO games (group_id, name, min_players_per_match, max_players_per_match, metric, star_threshold, gold_threshold, silver_threshold, bronze_threshold) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
        )
        .bind(group_id)
        .bind(name)
        .bind(min_players_per_match)
        .bind(max_players_per_match)
        .bind(metric)
        .bind(star_threshold)
        .bind(gold_threshold)
        .bind(silver_threshold)
        .bind(bronze_threshold)
        .fetch_one(executor)
        .await
    }

    pub async fn update<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        game_id: Uuid,
        name: &str,
        min_players_per_match: i32,
        max_players_per_match: i32,
        metric: ScoringMetric,
        star_threshold: Option<i32>,
        gold_threshold: Option<i32>,
        silver_threshold: Option<i32>,
        bronze_threshold: Option<i32>,
    ) -> Result<GameDb, sqlx::Error> {
        sqlx::query_as::<_, GameDb>(
            "UPDATE games SET name = $1, min_players_per_match = $2, max_players_per_match = $3, metric = $4, star_threshold = $5, gold_threshold = $6, silver_threshold = $7, bronze_threshold = $8 WHERE id = $9 RETURNING *",
        )
        .bind(name)
        .bind(min_players_per_match)
        .bind(max_players_per_match)
        .bind(metric)
        .bind(star_threshold)
        .bind(gold_threshold)
        .bind(silver_threshold)
        .bind(bronze_threshold)
        .bind(game_id)
        .fetch_one(executor)
        .await
    }

    pub async fn get<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        game_id: Uuid,
    ) -> Result<Option<GameDb>, sqlx::Error> {
        sqlx::query_as::<_, GameDb>("SELECT * FROM games WHERE id = $1")
            .bind(game_id)
            .fetch_optional(executor)
            .await
    }

    pub async fn delete<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        game_id: Uuid,
    ) -> Result<(), sqlx::Error> {
        sqlx::query_as::<_, GameDb>("DELETE FROM games WHERE id = $1")
            .bind(game_id)
            .fetch_optional(executor)
            .await?;

        Ok(())
    }

    pub async fn get_games_in_group<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        group_id: Uuid,
    ) -> Result<Vec<GameDb>, sqlx::Error> {
        sqlx::query_as::<_, GameDb>("SELECT * FROM games WHERE group_id = $1 ORDER BY name")
            .bind(group_id)
            .fetch_all(executor)
            .await
    }
}
