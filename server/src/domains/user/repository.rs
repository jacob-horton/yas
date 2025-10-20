use tokio_postgres::{Client, Row};

use super::model::{DbUser, InsertDbUser};

impl DbUser {
    fn from_row(row: &Row) -> Self {
        Self {
            id: row.get("id"),
            name: row.get("name"),
            email: row.get("email"),
            session_version: row.get("session_version"),
            password_hash: row.get("password_hash"),
            created_at: row.get("created_at"),
        }
    }
}

// TODO: move these to postgres and impl From
#[derive(Debug, Clone)]
pub enum DbError {
    QueryFailed,
    DuplicateKey,
    NoRows,
}

pub async fn find_by_email(client: &Client, email: &str) -> Result<DbUser, DbError> {
    let result = client
        .query(
            "SELECT id, name, email, session_version, password_hash, created_at FROM users WHERE email = $1::TEXT LIMIT 1",
            &[&email],
        )
        .await
        .map_err(|_| DbError::QueryFailed)?;

    let row = result.first().ok_or(DbError::NoRows)?;

    Ok(DbUser::from_row(row))
}

pub async fn find_by_id(client: &Client, id: i32) -> Result<DbUser, DbError> {
    let result = client
        .query(
            "SELECT id, name, email, session_version, password_hash, created_at FROM users WHERE id = $1 LIMIT 1",
            &[&id],
        )
        .await
        .map_err(|_| DbError::QueryFailed)?;

    let row = result.first().ok_or(DbError::NoRows)?;

    Ok(DbUser::from_row(row))
}

pub async fn create(client: &Client, user: InsertDbUser) -> Result<DbUser, DbError> {
    let result = client
        .query(
            "INSERT INTO users(name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, session_version, password_hash",
            &[&user.name, &user.email, &user.password_hash],
        )
        .await
        .map_err(|e| {
            if e.as_db_error().and_then(|db_err| db_err.constraint()).is_some_and(|c| c == "users_email_key") {
                return DbError::DuplicateKey;
            }

            DbError::QueryFailed
        })?;

    let row = result.first().ok_or(DbError::NoRows)?;

    Ok(DbUser::from_row(row))
}
