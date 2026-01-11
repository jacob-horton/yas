use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct UserDb {
    pub id: i32,
    pub username: String,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: i32,
    pub username: String,
    pub joined_at: String,
}

impl From<UserDb> for UserResponse {
    fn from(user: UserDb) -> Self {
        Self {
            id: user.id,
            username: user.username,
            joined_at: user.created_at.to_rfc3339(),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateUserReq {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateSessionReq {
    pub username: String,
    pub password: String,
}
