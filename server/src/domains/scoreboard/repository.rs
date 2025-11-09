use tokio_postgres::{Client, Row};

use crate::domains::{group::repository::get_user_groups, scoreboard::model::PlayerScore};

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

impl PlayerScore {
    fn from_row(row: &Row) -> Self {
        Self {
            points_per_game: row.get("points_per_game"),
            win_percent: row.get("win_percent"),
            user_id: row.get("user_id"),
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

pub async fn get_scores(client: &Client, scoreboard_id: i32) -> Result<Vec<PlayerScore>, DbError> {
    // TODO: limit
    let rows = client
        .query("
WITH game_results AS (
    SELECT
        s.game_id,
        s.user_id,
        s.score,
        -- find the winner's score per game
        MAX(s.score) OVER (PARTITION BY s.game_id) AS winning_score
    FROM scores s
    JOIN games g ON g.id = s.game_id
    WHERE g.scoreboard_id = $1
)
SELECT
    user_id,
    AVG(score)::numeric(10,2)::float AS points_per_game,
    ROUND(100.0 * SUM(CASE WHEN score = winning_score THEN 1 ELSE 0 END) / COUNT(*), 2)::int AS win_percent
FROM game_results
GROUP BY user_id
ORDER BY win_percent DESC;",
            &[&scoreboard_id],
        )
        .await?
        .iter()
        .map(PlayerScore::from_row)
        .collect();

    Ok(rows)
}

pub async fn create(
    client: &Client,
    name: &str,
    players_per_game: i32,
    group_id: i32,
) -> Result<DbScoreboard, ()> {
    let result = client
        .query(
            "INSERT INTO scoreboards(name, players_per_game, group_id) VALUES ($1, $2, $3) RETURNING id, name, players_per_game, group_id",
            &[&name, &players_per_game, &group_id],
        )
        .await.unwrap();

    let row = result.first().unwrap();

    Ok(DbScoreboard::from_row(row))
}
