use chrono::{Duration, Utc};
use resend_rs::{Resend, types::CreateEmailBaseOptions};
use sqlx::{PgExecutor, Postgres};
use uuid::Uuid;

use crate::errors::AppError;

#[derive(Debug, Clone)]
pub struct EmailRepo {
    pub resend_client: Resend,
}

impl EmailRepo {
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

    pub async fn send_verification_email(
        &self,
        address: &str,
        name: &str,
        token: Uuid,
    ) -> Result<(), AppError> {
        let verification_link = get_verification_link(&token);

        // TODO: switch to using `address` here for prod
        // Maybe use env to determine what email to use?
        let to = &format!(
            "delivered+{}@resend.dev",
            address.split_once("@").unwrap().0
        );

        let from = "onboarding@resend.dev";
        let subject = "Verify your email";
        let template = include_str!("../email_templates/invite.html");

        let html_body = template
            .replace("{{name}}", name)
            .replace("{{verification_link}}", &verification_link);

        let email = CreateEmailBaseOptions::new(from, [to], subject).with_html(&html_body);

        // Fire and forget (with logging)
        if let Err(e) = self.resend_client.emails.send(email).await {
            eprintln!("Resend failure for {}: {:?}", to, e);
        }

        Ok(())
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

fn get_verification_link(token: &Uuid) -> String {
    // TODO: get from env
    format!("http://localhost:3000/verify-email/{}", token)
}
