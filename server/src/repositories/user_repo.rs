use sqlx::{PgExecutor, Postgres};

use crate::models::user::UserDb;

pub struct UserRepo {}

impl UserRepo {
    pub async fn create<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        username: &str,
        password_hash: &str,
    ) -> Result<UserDb, sqlx::Error> {
        sqlx::query_as::<_, UserDb>(
            "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *",
        )
        .bind(username)
        .bind(password_hash)
        .fetch_one(executor)
        .await
    }

    pub async fn find_by_username<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        username: &str,
    ) -> Result<Option<UserDb>, sqlx::Error> {
        sqlx::query_as::<_, UserDb>("SELECT * FROM users WHERE username = $1")
            .bind(username)
            .fetch_optional(executor)
            .await
    }

    pub async fn find_by_id<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        id: i32,
    ) -> Result<Option<UserDb>, sqlx::Error> {
        sqlx::query_as::<_, UserDb>("SELECT * FROM users WHERE id = $1")
            .bind(id)
            .fetch_optional(executor)
            .await
    }
}
