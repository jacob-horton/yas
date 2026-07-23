use sqlx::PgConnection;
use uuid::Uuid;

use crate::models::{game::Interval, season::SeasonDb};

pub struct SeasonRepo {}

impl SeasonRepo {
    pub async fn get_latest(
        &self,
        tx: &mut PgConnection,
        game_id: Uuid,
    ) -> Result<SeasonDb, sqlx::Error> {
        let season = sqlx::query_as::<_, SeasonDb>(
            "SELECT * FROM seasons WHERE seasons.game_id = $1 ORDER BY start_date DESC LIMIT 1",
        )
        .bind(game_id)
        .fetch_one(&mut *tx)
        .await?;

        Ok(season)
    }

    pub async fn expired_seasons(
        &self,
        tx: &mut PgConnection,
    ) -> Result<Vec<SeasonDb>, sqlx::Error> {
        let season = sqlx::query_as::<_, SeasonDb>(
            r#"
            SELECT * FROM (
                SELECT DISTINCT ON (game_id) *
                FROM seasons
                ORDER BY game_id, start_date DESC
            ) latest
            WHERE end_date < NOW()
            "#,
        )
        .fetch_all(&mut *tx)
        .await?;

        Ok(season)
    }

    // NOTE: this only works for seasons with an end date
    pub async fn new_season(
        &self,
        tx: &mut PgConnection,
        old_season: &SeasonDb,
    ) -> Result<SeasonDb, sqlx::Error> {
        let last_season_number: i32 = sqlx::query_scalar(
            "SELECT number FROM seasons WHERE game_id = $1 ORDER BY start_date DESC LIMIT 1",
        )
        .bind(old_season.game_id)
        .fetch_optional(&mut *tx)
        .await?
        .unwrap_or(0);

        let duration: Option<Interval> =
            sqlx::query_scalar("SELECT season_duration FROM games WHERE id = $1")
                .bind(old_season.game_id)
                .fetch_one(&mut *tx)
                .await?;

        let season = sqlx::query_as::<_, SeasonDb>(
            r#"
            INSERT INTO seasons (game_id, number, start_date, end_date)
            VALUES ($1, $2, $3, $3 + $4)
            RETURNING *"#,
        )
        .bind(old_season.game_id)
        .bind(last_season_number + 1)
        .bind(old_season.end_date)
        .bind(duration)
        .fetch_one(&mut *tx)
        .await?;

        Ok(season)
    }
}
