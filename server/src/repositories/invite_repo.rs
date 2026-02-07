use chrono::{DateTime, Utc};
use sqlx::{PgExecutor, Postgres};
use uuid::Uuid;

use crate::models::invite::{InviteDb, InviteWithCreatedByNameDb};

pub struct InviteRepo {}

impl InviteRepo {
    pub async fn create<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        group_id: Uuid,
        created_by: Uuid,
        name: String,
        max_uses: Option<i32>,
        expires_at: Option<DateTime<Utc>>,
    ) -> Result<InviteDb, sqlx::Error> {
        sqlx::query_as::<_, InviteDb>(
            "INSERT INTO invites (group_id, created_by, name, max_uses, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        )
        .bind(group_id)
        .bind(created_by)
        .bind(name)
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
    ) -> Result<Option<InviteWithCreatedByNameDb>, sqlx::Error> {
        sqlx::query_as::<_, InviteWithCreatedByNameDb>("SELECT invites.*, users.name as created_by_name FROM invites JOIN users ON invites.created_by = users.id WHERE invites.id = $1 FOR UPDATE")
            .bind(code)
            .fetch_optional(executor)
            .await
    }

    pub async fn delete<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        code: Uuid,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM invites WHERE invites.id = $1")
            .bind(code)
            .execute(executor)
            .await?;

        Ok(())
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
    ) -> Result<Vec<InviteWithCreatedByNameDb>, sqlx::Error> {
        sqlx::query_as::<_, InviteWithCreatedByNameDb>("SELECT invites.*, users.name as created_by_name FROM invites JOIN users ON invites.created_by = users.id WHERE group_id = $1 ORDER BY created_at")
            .bind(group_id)
            .fetch_all(executor)
            .await
    }
}
