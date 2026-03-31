use async_trait::async_trait;
use std::env;
use uuid::Uuid;

use crate::errors::AppError;

#[cfg(feature = "production")]
use resend_rs::{Resend, types::CreateEmailBaseOptions};

#[derive(Debug, Clone, Copy)]
pub enum FromAddress {
    Welcome,
    Accounts,
}

impl FromAddress {
    pub fn as_str(&self) -> &'static str {
        match self {
            FromAddress::Welcome => "welcome@thescoreboard.app",
            FromAddress::Accounts => "accounts@thescoreboard.app",
        }
    }
}

#[async_trait]
pub trait EmailProvider: Send + Sync + Clone {
    async fn send_raw(
        &self,
        from: FromAddress,
        to: &str,
        subject: &str,
        html: &str,
    ) -> Result<(), AppError>;
}

#[cfg(feature = "production")]
#[derive(Clone)]
pub struct ResendProvider {
    pub client: Resend,
}

#[cfg(feature = "production")]
#[async_trait]
impl EmailProvider for ResendProvider {
    async fn send_raw(
        &self,
        from: FromAddress,
        to: &str,
        subject: &str,
        html: &str,
    ) -> Result<(), AppError> {
        let email = CreateEmailBaseOptions::new(from.as_str(), [to], subject).with_html(html);

        // Fire and forget (with logging), matching your original implementation
        if let Err(e) = self.client.emails.send(email).await {
            eprintln!("Resend failure for {}: {:?}", to, e);
        }

        Ok(())
    }
}

#[cfg(not(feature = "production"))]
#[derive(Clone)]
pub struct ConsoleProvider;

#[cfg(not(feature = "production"))]
#[async_trait]
impl EmailProvider for ConsoleProvider {
    async fn send_raw(
        &self,
        from: FromAddress,
        to: &str,
        subject: &str,
        html: &str,
    ) -> Result<(), AppError> {
        println!("\n========================================");
        println!("# Email");
        println!("From:    {}", from.as_str());
        println!("To:      {}", to);
        println!("Subject: {}", subject);
        println!("----------------------------------------");
        println!("{}", html);
        println!("========================================\n");
        Ok(())
    }
}

#[cfg(feature = "production")]
pub type ActiveEmailProvider = ResendProvider;

#[cfg(not(feature = "production"))]
pub type ActiveEmailProvider = ConsoleProvider;

#[derive(Clone)]
pub struct EmailService {
    provider: ActiveEmailProvider,
}

impl EmailService {
    pub fn new(provider: ActiveEmailProvider) -> Self {
        Self { provider }
    }

    pub async fn send_verification_email(
        &self,
        address: &str,
        name: &str,
        token: Uuid,
    ) -> Result<(), AppError> {
        let verification_link = Self::get_verification_link(&token);
        let subject = "Verify your email";
        let template = include_str!("../email_templates/invite.html");

        let html_body = template
            .replace("{{name}}", name)
            .replace("{{verification_link}}", &verification_link);

        self.provider
            .send_raw(FromAddress::Welcome, address, subject, &html_body)
            .await
    }

    pub async fn send_password_reset_email(
        &self,
        address: &str,
        token: Uuid,
    ) -> Result<(), AppError> {
        let reset_link = Self::get_reset_link(&token);
        let subject = "Reset your password";
        let template = include_str!("../email_templates/reset_password.html");

        let html_body = template.replace("{{reset_link}}", &reset_link);

        self.provider
            .send_raw(FromAddress::Accounts, address, subject, &html_body)
            .await
    }

    pub async fn send_password_reset_complete_email(&self, address: &str) -> Result<(), AppError> {
        let subject = "Password has been reset";
        let html_body = include_str!("../email_templates/reset_password_complete.html");

        self.provider
            .send_raw(FromAddress::Accounts, address, subject, html_body)
            .await
    }

    fn get_verification_link(token: &Uuid) -> String {
        let frontend_base = env::var("FRONTEND_URL").expect("FRONTEND_URL must be set");
        format!("{}/verify-email/{}", frontend_base, token)
    }

    fn get_reset_link(token: &Uuid) -> String {
        let frontend_base = env::var("FRONTEND_URL").expect("FRONTEND_URL must be set");
        format!("{}/reset-password/{}", frontend_base, token)
    }
}
