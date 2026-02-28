use crate::models::trim_string;
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

use crate::extractors::rate_limiting::payload::RateLimitKeyExtractor;

#[derive(Debug, Deserialize, Validate)]
pub struct CreateSessionReq {
    #[validate(email(message = "Email must be valid"))]
    #[serde(deserialize_with = "trim_string")]
    pub email: String,

    #[validate(length(min = 1, max = 1023, message = "Password must be at least 1 character"))]
    #[serde(deserialize_with = "trim_string")]
    pub password: String,
}

impl RateLimitKeyExtractor for CreateSessionReq {
    fn limit_key(&self) -> String {
        self.email.clone()
    }
}

#[derive(Debug, Deserialize)]
pub struct VerifyEmailReq {
    pub token: Uuid,
}

#[derive(Debug, Deserialize, Validate)]
pub struct ResetPasswordReq {
    pub token: Uuid,

    #[validate(length(
        min = 8,
        max = 1023,
        message = "Password must be between 8 and 1023 chars"
    ))]
    #[serde(deserialize_with = "trim_string")]
    pub password: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct ForgotPasswordReq {
    #[validate(email(message = "Email must be valid"))]
    #[serde(deserialize_with = "trim_string")]
    pub email: String,
}

impl RateLimitKeyExtractor for ForgotPasswordReq {
    fn limit_key(&self) -> String {
        self.email.clone()
    }
}
