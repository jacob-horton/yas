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
}

fn get_verification_link(token: &Uuid) -> String {
    // TODO: get from env
    format!("http://localhost:3000/verify-email/{}", token)
}
