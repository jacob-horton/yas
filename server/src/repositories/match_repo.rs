use sqlx::{PgConnection, Postgres, QueryBuilder};
use uuid::Uuid;

use crate::models::game_match::{MatchDb, MatchDetailsDb, MatchScoreDb};

pub struct MatchRepo {}

impl MatchRepo {
    pub async fn create(
        &self,
        tx: &mut PgConnection,
        game_id: Uuid,
        scores: Vec<MatchScoreDb>,
    ) -> Result<MatchDb, sqlx::Error> {
        let match_details = sqlx::query_as::<_, MatchDetailsDb>(
            "INSERT INTO matches (game_id) VALUES ($1) RETURNING *",
        )
        .bind(game_id)
        .fetch_one(&mut *tx)
        .await?;

        let mut query_builder: QueryBuilder<Postgres> =
            QueryBuilder::new("INSERT INTO match_scores (match_id, user_id, score) ");

        query_builder.push_values(scores, |mut b, score| {
            b.push_bind(match_details.id)
                .push_bind(score.user_id)
                .push_bind(score.score);
        });

        query_builder.push(" RETURNING *");
        let scores = query_builder
            .build_query_as::<MatchScoreDb>()
            .fetch_all(&mut *tx)
            .await?;

        Ok(MatchDb {
            id: match_details.id,
            game_id: match_details.game_id,
            played_at: match_details.played_at,
            scores,
        })
    }
}
