use chrono::{Duration, Utc};
use sqlx::{PgExecutor, Postgres};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct PasswordResetsRepo {}

impl PasswordResetsRepo {
    pub async fn create_reset_record<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        user_id: &Uuid,
        token_hash: &str,
    ) -> Result<(), sqlx::Error> {
        let expiration = Utc::now() + Duration::minutes(15);

        sqlx::query(
            "INSERT INTO password_resets (user_id, token_hash, expiration) VALUES ($1, $2, $3)",
        )
        .bind(user_id)
        .bind(token_hash)
        .bind(expiration)
        .execute(executor)
        .await?;

        Ok(())
    }

    pub async fn delete_token_and_get_user_id<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        token_hash: &str,
    ) -> Result<Option<Uuid>, sqlx::Error> {
        sqlx::query_scalar(
            "DELETE FROM password_resets WHERE token_hash = $1 AND expiration > NOW() RETURNING user_id",
        )
        .bind(token_hash)
        .fetch_optional(executor)
        .await
    }

    pub async fn delete_all_tokens_for_user_id<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        user_id: &Uuid,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM password_resets WHERE user_id = $1")
            .bind(user_id)
            .execute(executor)
            .await?;

        Ok(())
    }

    pub async fn delete_expired_tokens<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
    ) -> Result<u64, sqlx::Error> {
        let result = sqlx::query("DELETE FROM password_resets WHERE expiration < NOW()")
            .execute(executor)
            .await?;

        Ok(result.rows_affected())
    }
}
