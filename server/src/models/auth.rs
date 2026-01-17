use serde::Deserialize;
use validator::Validate;

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
