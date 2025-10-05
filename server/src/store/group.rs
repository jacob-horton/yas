use serde::Serialize;
use tokio_postgres::NoTls;

#[derive(Serialize)]
pub struct Score {
    pub name: String,
    pub win_percent: i32,
    pub points_per_game: f64,
}

pub async fn get_data() -> Result<Vec<Score>, Box<dyn std::error::Error>> {
    let (client, connection) =
        tokio_postgres::connect("host=localhost user=user password=password", NoTls).await?;

    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("connection error: {}", e);
        }
    });

    let rows: Vec<Score> = client
        .query("SELECT name, win_percent, points_per_game FROM scores", &[])
        .await?
        .iter()
        .map(|r| Score {
            name: r.get("name"),
            win_percent: r.get("win_percent"),
            points_per_game: r.get("points_per_game"),
        })
        .collect();

    Ok(rows)
}
