use chrono::{DateTime, Utc};

#[derive(Debug, Clone)]
pub struct DbUser {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub session_version: i32,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct InsertDbUser {
    pub name: String,
    pub email: String,
    pub password_hash: String,
}
