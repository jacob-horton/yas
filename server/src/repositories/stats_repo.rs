use sqlx::types::Uuid;

use crate::models::stats::RawMatchStats;

pub struct StatsRepo {}

impl StatsRepo {
    pub async fn get_last_n_matches_per_player(
        &self,
        pool: &sqlx::PgPool,
        game_id: Uuid,
        n: i32,
    ) -> Result<Vec<RawMatchStats>, sqlx::Error> {
        sqlx::query_as::<_, RawMatchStats>(
            r#"
            WITH ranked_scores AS (
                SELECT
                    ms.user_id,
                    ms.match_id,
                    ms.score,
                    m.played_at,
                    RANK() OVER (PARTITION BY ms.match_id ORDER BY ms.score DESC) as rank_in_match,
                    ROW_NUMBER() OVER (PARTITION BY ms.user_id ORDER BY m.played_at DESC) as history_index
                FROM match_scores ms
                JOIN matches m ON m.id = ms.match_id
                WHERE m.game_id = $1
            )
            SELECT user_id, match_id, score, played_at, rank_in_match
            FROM ranked_scores
            WHERE history_index <= $2
            ORDER BY user_id, played_at DESC
            "#,
        )
        .bind(game_id)
        .bind(n as i64)
        .fetch_all(pool)
        .await
    }
}
