use sqlx::{PgExecutor, Postgres, types::Uuid};

use crate::models::game::GameDb;

pub struct GameRepo {}

impl GameRepo {
    pub async fn create<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        group_id: Uuid,
        name: &str,
        players_per_match: i32,
    ) -> Result<GameDb, sqlx::Error> {
        sqlx::query_as::<_, GameDb>(
            "INSERT INTO games (group_id, name, players_per_match) VALUES ($1, $2, $3) RETURNING *",
        )
        .bind(group_id)
        .bind(name)
        .bind(players_per_match)
        .fetch_one(executor)
        .await
    }
}
