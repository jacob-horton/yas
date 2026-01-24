use chrono::{DateTime, Utc};
use sqlx::{PgExecutor, Postgres, types::Uuid};

use crate::models::invite::InviteDb;

pub struct InviteRepo {}

impl InviteRepo {
    pub async fn create<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        group_id: Uuid,
        created_by: Uuid,
        max_uses: Option<i32>,
        expires_at: Option<DateTime<Utc>>,
    ) -> Result<InviteDb, sqlx::Error> {
        sqlx::query_as::<_, InviteDb>(
            "INSERT INTO invites (group_id, created_by, max_uses, expires_at) VALUES ($1, $2, $3, $4) RETURNING *",
        )
        .bind(group_id)
        .bind(created_by)
        .bind(max_uses)
        .bind(expires_at)
        .fetch_one(executor)
        .await
    }

    // Finds invite by code and locks until updated
    pub async fn find_by_code_for_update<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        code: Uuid,
    ) -> Result<Option<InviteDb>, sqlx::Error> {
        sqlx::query_as::<_, InviteDb>("SELECT * FROM invites WHERE id = $1 FOR UPDATE")
            .bind(code)
            .fetch_optional(executor)
            .await
    }

    pub async fn increment_uses<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        code: Uuid,
    ) -> Result<InviteDb, sqlx::Error> {
        sqlx::query_as::<_, InviteDb>(
            "UPDATE invites SET uses = uses + 1 WHERE id = $1 RETURNING *",
        )
        .bind(code)
        .fetch_one(executor)
        .await
    }

    pub async fn get_invites_for_group<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        group_id: Uuid,
    ) -> Result<Vec<InviteDb>, sqlx::Error> {
        sqlx::query_as::<_, InviteDb>("SELECT * FROM invites WHERE group_id = $1")
            .bind(group_id)
            .fetch_all(executor)
            .await
    }
}
