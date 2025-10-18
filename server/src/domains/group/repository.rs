use tokio_postgres::{Client, Row};

use super::model::DbScore;

impl DbScore {
    fn from_row(row: &Row) -> Self {
        Self {
            name: row.get("name"),
            win_percent: row.get("win_percent"),
            points_per_game: row.get("points_per_game"),
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
