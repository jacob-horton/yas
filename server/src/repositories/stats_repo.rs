use uuid::Uuid;

use crate::models::stats::{PlayerMatchDb, RawHighlight, RawMatchStats};

pub struct StatsRepo {}

impl StatsRepo {
    pub async fn get_all_matches(
        &self,
        pool: &sqlx::PgPool,
        game_id: Uuid,
    ) -> Result<Vec<RawMatchStats>, sqlx::Error> {
        sqlx::query_as::<_, RawMatchStats>(
            r#"
            SELECT
                u.name,
                u.avatar,
                u.avatar_colour,
                lb.user_id,
                lb.match_id,
                lb.score,
                m.played_at,
                lb.rank as rank_in_match
            FROM match_leaderboards lb
            JOIN matches m ON m.id = lb.match_id
            JOIN users u ON u.id = lb.user_id
            WHERE m.game_id = $1
            ORDER BY m.played_at DESC;
            "#,
        )
        .bind(game_id)
        .fetch_all(pool)
        .await
    }

    pub async fn get_player_history(
        &self,
        pool: &sqlx::PgPool,
        game_id: Uuid,
        user_id: Uuid,
    ) -> Result<Vec<PlayerMatchDb>, sqlx::Error> {
        sqlx::query_as::<_, PlayerMatchDb>(
            r#"
            SELECT
                lb.match_id,
                lb.score,
                lb.rank as rank_in_match,
                m.played_at
            FROM matches m
            JOIN match_leaderboards lb ON m.id = lb.match_id
            WHERE m.game_id = $1 AND lb.user_id = $2
            ORDER BY m.played_at DESC
            "#,
        )
        .bind(game_id)
        .bind(user_id)
        .fetch_all(pool)
        .await
    }

    pub async fn get_highlights(
        &self,
        pool: &sqlx::PgPool,
        game_id: Uuid,
    ) -> Result<Vec<RawHighlight>, sqlx::Error> {
        let rows = sqlx::query_as::<_, RawHighlight>(
            r#"
            WITH
            scores AS (
                SELECT ms.user_id, ms.score
                FROM match_scores ms
                JOIN matches m ON ms.match_id = m.id
                WHERE m.game_id = $1
            ),
            ranks AS (
                SELECT lb.user_id, lb.rank
                FROM match_leaderboards lb
                JOIN matches m ON lb.match_id = m.id
                WHERE m.game_id = $1
            ),

            -- Highest win rate
            stat_win_rate AS (
                SELECT
                    user_id,
                    (COUNT(*) FILTER (WHERE rank = 1))::FLOAT8 / COUNT(*)::FLOAT8 as val,
                    'highest_win_rate' as stat_type
                FROM ranks
                GROUP BY user_id
                ORDER BY val DESC 
                LIMIT 1
            ),

            -- Highest average score
            stat_avg_score AS (
                SELECT
                    user_id,
                    AVG(score)::FLOAT8 as val,
                    'highest_average_score' as stat_type
                FROM scores
                GROUP BY user_id
                ORDER BY val DESC
                LIMIT 1
            ),

            -- Highest single score
            stat_high_score AS (
                SELECT
                    user_id,
                    score::FLOAT8 as val,
                    'highest_single_score' as stat_type
                FROM scores
                ORDER BY val DESC
                LIMIT 1
            ),

            -- Most games played
            stat_most_games AS (
                SELECT
                    user_id,
                    COUNT(*)::FLOAT8 as val,
                    'most_games_played' as stat_type
                FROM scores
                GROUP BY user_id
                ORDER BY val DESC
                LIMIT 1
            ),

            -- Combine them all
            all_stats AS (
                SELECT * FROM stat_win_rate
                UNION ALL SELECT * FROM stat_avg_score
                UNION ALL SELECT * FROM stat_high_score
                UNION ALL SELECT * FROM stat_most_games
            )

            -- Join with users to get names
            SELECT
                s.user_id,
                u.name as user_name,
                s.val as value,
                s.stat_type
            FROM all_stats s
            JOIN users u ON u.id = s.user_id
            "#,
        )
        .bind(game_id)
        .fetch_all(pool)
        .await?;

        Ok(rows)
    }
}
