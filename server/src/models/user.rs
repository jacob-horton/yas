use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, types::Uuid};
use validator::Validate;

#[derive(Debug, FromRow)]
pub struct UserDb {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: String,
    pub email: String,
    pub name: String,
    pub created_at: String,
}

impl From<UserDb> for UserResponse {
    fn from(user: UserDb) -> Self {
        Self {
            id: user.id.to_string(),
            name: user.name,
            email: user.email,
            created_at: user.created_at.to_rfc3339(),
        }
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateUserReq {
    #[validate(email(message = "Email must be valid"))]
    pub email: String,
    #[validate(length(min = 1, max = 512, message = "Name must be between 1 and 512 chars"))]
    pub name: String,
    #[validate(length(
        min = 8,
        max = 1023,
        message = "Password must be between 8 and 1023 chars"
    ))]
    pub password: String,
}
