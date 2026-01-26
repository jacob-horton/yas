use sqlx::types::Uuid;

use crate::models::stats::{PlayerMatchDb, RawMatchStats, StatsLifetime, StatsPeriod};

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
            SELECT u.name, rs.user_id, rs.match_id, rs.score, rs.played_at, rs.rank_in_match
            FROM ranked_scores as rs
            JOIN users u ON u.id = rs.user_id
            WHERE history_index <= $2
            ORDER BY user_id, played_at DESC
            "#,
        )
        .bind(game_id)
        .bind(n as i64)
        .fetch_all(pool)
        .await
    }

    pub async fn get_last_n_matches_single_player(
        &self,
        pool: &sqlx::PgPool,
        game_id: Uuid,
        user_id: Uuid,
        n: i32,
    ) -> Result<Vec<PlayerMatchDb>, sqlx::Error> {
        sqlx::query_as::<_, PlayerMatchDb>(
            r#"
            SELECT
                ms.match_id,
                ms.score,
                m.played_at,
                (
                    SELECT COUNT(*) + 1
                    FROM match_scores ms2
                    WHERE ms2.match_id = ms.match_id
                    AND ms2.score > ms.score
                ) as rank_in_match
            FROM matches m
            JOIN match_scores ms ON m.id = ms.match_id
            WHERE m.game_id = $1 AND ms.user_id = $2
            ORDER BY m.played_at DESC
            LIMIT $3
            "#,
        )
        .bind(game_id)
        .bind(user_id)
        .bind(n as i64)
        .fetch_all(pool)
        .await
    }

    pub async fn get_lifetime_stats(
        &self,
        pool: &sqlx::PgPool,
        game_id: Uuid,
        user_id: Uuid,
    ) -> Result<StatsLifetime, sqlx::Error> {
        sqlx::query_as::<_, StatsLifetime>(
            r#"
        SELECT
            COALESCE(AVG(ms.score), 0)::FLOAT8 as average_score,
            COALESCE(MAX(ms.score), 0)::BIGINT as best_score,
            COUNT(*)::BIGINT as total_games,

            CASE
                WHEN COUNT(*) = 0 THEN 0.0
                ELSE
                    COUNT(*) FILTER (
                        WHERE (
                            SELECT COUNT(*) + 1
                            FROM match_scores ms2
                            WHERE ms2.match_id = ms.match_id
                            AND ms2.score > ms.score
                        ) = 1
                    )::FLOAT8 / COUNT(*)::FLOAT8 
            END as win_rate

        FROM matches m
        JOIN match_scores ms ON m.id = ms.match_id
        WHERE m.game_id = $1 AND ms.user_id = $2;
        "#,
        )
        .bind(game_id)
        .bind(user_id)
        .fetch_one(pool)
        .await
    }

    pub async fn get_period_stats(
        &self,
        pool: &sqlx::PgPool,
        game_id: Uuid,
        user_id: Uuid,
        n: i32,
    ) -> Result<StatsPeriod, sqlx::Error> {
        // TODO: rank
        sqlx::query_as::<_, StatsPeriod>(
            r#"
            WITH recent_activity AS (
                SELECT
                    m.id as match_id,
                    ms.score
                FROM matches m
                JOIN match_scores ms ON m.id = ms.match_id
                WHERE m.game_id = $1 AND ms.user_id = $2
                ORDER BY m.played_at DESC
                LIMIT $3
            )
            SELECT
                COALESCE(AVG(ra.score), 0)::FLOAT8 as average_score,
                COALESCE(MAX(ra.score), 0)::BIGINT as best_score,

                0::BIGINT as rank,

                CASE
                    WHEN COUNT(*) = 0 THEN 0.0
                    ELSE
                        COUNT(*) FILTER (
                            WHERE NOT EXISTS (
                                SELECT 1 
                                FROM match_scores opponent 
                                WHERE opponent.match_id = ra.match_id 
                                AND opponent.score > ra.score
                            )
                        )::FLOAT8 / COUNT(*)::FLOAT8
                END as win_rate

            FROM recent_activity ra
        "#,
        )
        .bind(game_id)
        .bind(user_id)
        .bind(n)
        .fetch_one(pool)
        .await
    }
}
