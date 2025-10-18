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

pub async fn get_scores(client: &Client) -> Result<Vec<DbScore>, ()> {
    let rows: Vec<DbScore> = client
        .query(
            "SELECT name, win_percent, points_per_game FROM scores ORDER BY win_percent DESC",
            &[],
        )
        .await
        .unwrap()
        .iter()
        .map(|r| DbScore {
            name: r.get("name"),
            win_percent: r.get("win_percent"),
            points_per_game: r.get("points_per_game"),
        })
        .collect();

    Ok(rows)
}
