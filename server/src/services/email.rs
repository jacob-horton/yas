use std::env;

use resend_rs::{Resend, types::CreateEmailBaseOptions};
use uuid::Uuid;

use crate::errors::AppError;

#[derive(Debug, Clone)]
pub struct EmailService {
    pub resend_client: Resend,
}

impl EmailService {
    pub async fn send_verification_email(
        &self,
        address: &str,
        name: &str,
        token: Uuid,
    ) -> Result<(), AppError> {
        let verification_link = get_verification_link(&token);

        let to = address;
        let from = "welcome@thescoreboard.app";
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

    pub async fn send_password_reset_email(
        &self,
        address: &str,
        token: Uuid,
    ) -> Result<(), AppError> {
        let reset_link = get_reset_link(&token);

        let to = address;
        let from = "accounts@thescoreboard.app";
        let subject = "Reset your password";
        let template = include_str!("../email_templates/reset_password.html");

        let html_body = template.replace("{{reset_link}}", &reset_link);

        let email = CreateEmailBaseOptions::new(from, [to], subject).with_html(&html_body);

        // Fire and forget (with logging)
        if let Err(e) = self.resend_client.emails.send(email).await {
            eprintln!("Resend failure for {}: {:?}", to, e);
        }

        Ok(())
    }

    pub async fn send_password_reset_complete_email(&self, address: &str) -> Result<(), AppError> {
        let to = address;
        let from = "accounts@thescoreboard.app";
        let subject = "Password has been reset";
        let html_body = include_str!("../email_templates/reset_password_complete.html");

        let email = CreateEmailBaseOptions::new(from, [to], subject).with_html(html_body);

        // Fire and forget (with logging)
        if let Err(e) = self.resend_client.emails.send(email).await {
            eprintln!("Resend failure for {}: {:?}", to, e);
        }

        Ok(())
    }
}

fn get_verification_link(token: &Uuid) -> String {
    let frontend_base = env::var("FRONTEND_URL").expect("FRONTEND_URL must be set");
    format!("{}/verify-email/{}", frontend_base, token)
}

fn get_reset_link(token: &Uuid) -> String {
    let frontend_base = env::var("FRONTEND_URL").expect("FRONTEND_URL must be set");
    format!("{}/reset-password/{}", frontend_base, token)
}
