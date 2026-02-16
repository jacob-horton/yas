use chrono::{DateTime, Duration, Utc};
use resend_rs::{Resend, types::CreateEmailBaseOptions};
use sqlx::{PgExecutor, Postgres};
use uuid::Uuid;

use crate::errors::AppError;

#[derive(Debug, Clone)]
pub struct EmailRepo {
    pub resend_client: Resend,
}

impl EmailRepo {
    pub async fn send_invite<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        address: &str,
        name: &str,
    ) -> Result<(), AppError> {
        let token = Uuid::new_v4();
        let expiration = Utc::now() + Duration::hours(24);
        let verification_link = get_verification_link(&token);

        self.save_verification(executor, address, token, expiration)
            .await?;

        let from = "onboarding@resend.dev";
        // TODO: switch to using `address` here for prod
        // Maybe use env to determine what email to use?
        let to = &format!(
            "delivered+{}@resend.dev",
            address.split_once("@").unwrap().0
        );
        let subject = "Welcome!";

        let template = include_str!("../email_templates/invite.html");
        let html_body = template
            .replace("{{name}}", name)
            .replace("{{verification_link}}", &verification_link);

        let email = CreateEmailBaseOptions::new(from, [to], subject).with_html(&html_body);

        let send_result = self.resend_client.emails.send(email).await;
        if let Err(e) = send_result {
            // Log but ignore error - don't want to return 500
            eprintln!("Failed to send verification email to {}: {:?}", to, e);
        }

        Ok(())
    }

    async fn save_verification<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        email: &str,
        token: Uuid,
        expiration: DateTime<Utc>,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            "INSERT INTO email_verifications (email, token, expiration) VALUES ($1, $2, $3)",
        )
        .bind(email.to_lowercase())
        .bind(token)
        .bind(expiration)
        .execute(executor)
        .await?;

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
}

fn get_verification_link(token: &Uuid) -> String {
    // TODO: get from env
    format!("http://localhost:3000/verify-email/{}", token.to_string())
}
