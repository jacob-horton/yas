#[derive(Debug, Clone)]
pub struct DbUser {
    pub id: i32,
    pub email: String,
    pub session_version: i32,
    pub password_hash: String,
}
