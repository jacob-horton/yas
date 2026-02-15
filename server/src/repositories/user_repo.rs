use sqlx::{PgExecutor, Postgres};
use uuid::Uuid;

use crate::models::user::{Avatar, AvatarColour, UserDb};

pub struct UserRepo {}

impl UserRepo {
    pub async fn create<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        name: &str,
        email: &str,
        password_hash: &str,
    ) -> Result<UserDb, sqlx::Error> {
        sqlx::query_as::<_, UserDb>(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
        )
        .bind(name)
        .bind(email.to_lowercase())
        .bind(password_hash)
        .fetch_one(executor)
        .await
    }

    pub async fn update<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        id: Uuid,
        name: &str,
        email: &str,
        avatar: Avatar,
        avatar_colour: AvatarColour,
    ) -> Result<UserDb, sqlx::Error> {
        sqlx::query_as::<_, UserDb>(
            "UPDATE users SET name = $1, email = $2, avatar = $3, avatar_colour = $4 WHERE id = $5 RETURNING *",
        )
        .bind(name)
        .bind(email.to_lowercase())
        .bind(avatar)
        .bind(avatar_colour)
        .bind(id)
        .fetch_one(executor)
        .await
    }

    pub async fn update_password<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        id: &Uuid,
        password_hash: &str,
    ) -> Result<UserDb, sqlx::Error> {
        sqlx::query_as::<_, UserDb>("UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *")
            .bind(password_hash)
            .bind(id)
            .fetch_one(executor)
            .await
    }

    pub async fn find_by_email<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        email: &str,
    ) -> Result<Option<UserDb>, sqlx::Error> {
        sqlx::query_as::<_, UserDb>("SELECT * FROM users WHERE email = $1")
            .bind(email.to_lowercase())
            .fetch_optional(executor)
            .await
    }

    pub async fn find_by_id<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        id: &Uuid,
    ) -> Result<Option<UserDb>, sqlx::Error> {
        sqlx::query_as::<_, UserDb>("SELECT * FROM users WHERE id = $1")
            .bind(id)
            .fetch_optional(executor)
            .await
    }
}
