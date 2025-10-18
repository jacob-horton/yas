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
        .map(|r| DbScore::from_row(r))
        .collect();

    Ok(rows)
}
