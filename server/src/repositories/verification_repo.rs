use chrono::{Duration, Utc};
use sqlx::{PgExecutor, Postgres};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct VerificationRepo {}

impl VerificationRepo {
    pub async fn create_verification_record<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        email: &str,
    ) -> Result<Uuid, sqlx::Error> {
        let token = Uuid::new_v4();
        let expiration = Utc::now() + Duration::hours(24);

        sqlx::query(
            "INSERT INTO email_verifications (email, token, expiration) VALUES ($1, $2, $3)",
        )
        .bind(email.to_lowercase())
        .bind(token)
        .bind(expiration)
        .execute(executor)
        .await?;

        Ok(token)
    }

    pub async fn delete_token_and_get_email<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        token: Uuid,
    ) -> Result<Option<String>, sqlx::Error> {
        sqlx::query_scalar(
            "DELETE FROM email_verifications WHERE token = $1 AND expiration > NOW() RETURNING email",
        )
        .bind(token)
        .fetch_optional(executor)
        .await
    }

    pub async fn delete_all_tokens_for_email<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        email: &str,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            "DELETE FROM email_verifications WHERE email = $1",
            email.to_lowercase()
        )
        .execute(executor)
        .await?;

        Ok(())
    }
}
