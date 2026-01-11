use sqlx::PgPool;

use crate::models::user::UserDb;

pub struct UserRepo {
    pool: PgPool,
}

impl UserRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, username: &str, password_hash: &str) -> Result<UserDb, sqlx::Error> {
        sqlx::query_as::<_, UserDb>(
            "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *",
        )
        .bind(username)
        .bind(password_hash)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn find_by_username(&self, username: &str) -> Result<Option<UserDb>, sqlx::Error> {
        sqlx::query_as::<_, UserDb>("SELECT * FROM users WHERE username = $1")
            .bind(username)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn find_by_id(&self, id: i32) -> Result<Option<UserDb>, sqlx::Error> {
        sqlx::query_as::<_, UserDb>("SELECT * FROM users WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }
}
