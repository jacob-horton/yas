use tokio_postgres::{Client, Row};

use crate::domains::group::repository::get_user_groups;

use super::model::DbScoreboard;

impl DbScoreboard {
    fn from_row(row: &Row) -> Self {
        Self {
            id: row.get("id"),
            name: row.get("name"),
            players_per_game: row.get("players_per_game"),
            group_id: row.get("group_id"),
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

pub async fn get_user_scoreboards(
    client: &Client,
    user_id: i32,
) -> Result<Vec<DbScoreboard>, DbError> {
    let groups = get_user_groups(client, user_id).await.unwrap();
    let group_ids: Vec<_> = groups.iter().map(|g| g.id).collect();
    let rows: Vec<DbScoreboard> = client
        .query(
            "SELECT id, name, players_per_game, group_id
            FROM scoreboards
            WHERE group_id = ANY($1)",
            &[&group_ids],
        )
        .await?
        .iter()
        .map(DbScoreboard::from_row)
        .collect();

    Ok(rows)
}
