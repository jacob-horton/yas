use sqlx::{PgExecutor, Postgres};

use crate::models::group::GroupDb;

pub struct GroupRepo {}

impl GroupRepo {
    pub async fn create<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        name: &str,
        created_by: i32,
    ) -> Result<GroupDb, sqlx::Error> {
        sqlx::query_as::<_, GroupDb>(
            "INSERT INTO groups (name, created_by) VALUES ($1, $2) RETURNING *",
        )
        .bind(name)
        .bind(created_by)
        .fetch_one(executor)
        .await
    }

    pub async fn find_by_id<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        id: i32,
    ) -> Result<Option<GroupDb>, sqlx::Error> {
        sqlx::query_as::<_, GroupDb>("SELECT * FROM groups WHERE id = $1")
            .bind(id)
            .fetch_optional(executor)
            .await
    }

    pub async fn add_member<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        group_id: i32,
        user_id: i32,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("INSERT INTO group_members (user_id, group_id) VALUES ($1, $2)")
            .bind(user_id)
            .bind(group_id)
            .execute(executor)
            .await?;

        Ok(())
    }
}
