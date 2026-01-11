use serde::Deserialize;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct CreateSessionReq {
    #[validate(length(min = 3, max = 50, message = "Username must be between 3 and 50 chars"))]
    pub username: String,
    #[validate(length(min = 3, max = 50, message = "Username must be between 3 and 50 chars"))]
    pub password: String,
}
