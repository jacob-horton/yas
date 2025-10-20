use tokio_postgres::{Client, Row};

use super::model::{DbGroup, DbScore};

impl DbScore {
    fn from_row(row: &Row) -> Self {
        Self {
            name: row.get("name"),
            win_percent: row.get("win_percent"),
            points_per_game: row.get("points_per_game"),
        }
    }
}

impl DbGroup {
    fn from_row(row: &Row) -> Self {
        Self {
            id: row.get("id"),
            name: row.get("name"),
            created_at: row.get("created_at"),
        }
    }
}

#[derive(Debug)]
pub struct DbError(pub tokio_postgres::Error);

impl From<tokio_postgres::Error> for DbError {
    fn from(value: tokio_postgres::Error) -> Self {
        Self(value)
    }
}

pub async fn get_scores(client: &Client) -> Result<Vec<DbScore>, DbError> {
    let rows: Vec<DbScore> = client
        .query(
            "SELECT name, win_percent, points_per_game FROM scores ORDER BY win_percent DESC",
            &[],
        )
        .await?
        .iter()
        .map(DbScore::from_row)
        .collect();

    Ok(rows)
}

pub async fn get_user_groups(client: &Client, user_id: i32) -> Result<Vec<DbGroup>, DbError> {
    let rows: Vec<DbGroup> = client
        .query(
            "SELECT groups.id, groups.name, groups.created_at
            FROM groups
            JOIN group_members ON group_members.group_id = groups.id
            WHERE group_members.user_id = $1",
            &[&user_id],
        )
        .await?
        .iter()
        .map(DbGroup::from_row)
        .collect();

    Ok(rows)
}

pub async fn create_group(client: &Client, name: &str) -> Result<DbGroup, DbError> {
    let rows: Vec<DbGroup> = client
        .query(
            "INSERT INTO groups(name) VALUES ($1::TEXT)
            RETURNING id, name, created_at",
            &[&name],
        )
        .await?
        .iter()
        .map(DbGroup::from_row)
        .collect();

    Ok(rows.first().unwrap().to_owned())
}

#[derive(Debug, Clone)]
pub enum MemberType {
    Member,
    Admin,
    Owner,
}

impl MemberType {
    fn as_str(&self) -> &'static str {
        match self {
            Self::Member => "member",
            Self::Admin => "admin",
            Self::Owner => "owner",
        }
    }
}

pub async fn add_user_to_group(
    client: &Client,
    group_id: i32,
    user_id: i32,
    member_type: MemberType,
) -> Result<(), DbError> {
    client
        .query(
            "INSERT INTO group_members(user_id, group_id, role) VALUES ($1, $2, $3::TEXT)",
            &[&user_id, &group_id, &member_type.as_str()],
        )
        .await?;

    Ok(())
}
