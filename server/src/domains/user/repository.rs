use tokio_postgres::{Client, Row};

use super::model::DbUser;

impl DbUser {
    fn from_row(row: &Row) -> Self {
        Self {
            id: row.get("id"),
            email: row.get("email"),
            session_version: row.get("session_version"),
            password_hash: row.get("password_hash"),
        }
    }
}

pub async fn find_by_email(client: &Client, email: &str) -> Result<DbUser, ()> {
    let result = client
        .query(
            "SELECT id, email, session_version, password_hash FROM users WHERE email = $1::TEXT LIMIT 1",
            &[&email],
        )
        .await
        .map_err(|_| ())?;

    let row = result.first().ok_or(())?;

    Ok(DbUser::from_row(&row))
}

pub async fn find_by_id(client: &Client, id: i32) -> Result<DbUser, ()> {
    let result = client
        .query(
            "SELECT id, email, session_version, password_hash FROM users WHERE id = $1 LIMIT 1",
            &[&id],
        )
        .await
        .map_err(|_| ())?;

    let row = result.first().ok_or(())?;

    Ok(DbUser::from_row(&row))
}
