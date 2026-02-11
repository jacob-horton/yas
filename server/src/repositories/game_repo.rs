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
        players_per_match: i32,
        metric: ScoringMetric,
    ) -> Result<GameDb, sqlx::Error> {
        sqlx::query_as::<_, GameDb>(
            "INSERT INTO games (group_id, name, players_per_match, metric) VALUES ($1, $2, $3, $4) RETURNING *",
        )
        .bind(group_id)
        .bind(name)
        .bind(players_per_match)
        .bind(metric)
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
