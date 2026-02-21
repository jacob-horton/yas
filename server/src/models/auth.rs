use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

use crate::extractors::rate_limiting::payload::RateLimitKeyExtractor;

#[derive(Debug, Deserialize, Validate)]
pub struct CreateSessionReq {
    #[validate(email(message = "Email must be valid"))]
    pub email: String,
    #[validate(length(
        min = 8,
        max = 1023,
        message = "Password must be between 8 and 1023 chars"
    ))]
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct VerifyEmailReq {
    pub token: Uuid,
}

impl RateLimitKeyExtractor for CreateSessionReq {
    fn limit_key(&self) -> String {
        self.email.clone()
    }
}
