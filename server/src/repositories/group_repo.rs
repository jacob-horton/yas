use sqlx::{PgExecutor, Postgres, types::Uuid};

use crate::models::{
    group::{GroupDb, GroupMemberDb, GroupMemberDetailsDb, GroupMemberRole},
    user::UserDb,
};

pub struct GroupRepo {}

impl GroupRepo {
    pub async fn create<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        name: &str,
        created_by: Uuid,
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
        id: Uuid,
    ) -> Result<Option<GroupDb>, sqlx::Error> {
        sqlx::query_as::<_, GroupDb>("SELECT * FROM groups WHERE id = $1")
            .bind(id)
            .fetch_optional(executor)
            .await
    }

    pub async fn add_member<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        group_id: Uuid,
        user_id: Uuid,
        role: GroupMemberRole,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("INSERT INTO group_members (user_id, group_id, role) VALUES ($1, $2, $3)")
            .bind(user_id)
            .bind(group_id)
            .bind(role)
            .execute(executor)
            .await?;

        Ok(())
    }

    pub async fn get_member<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        group_id: Uuid,
        user_id: Uuid,
    ) -> Result<Option<GroupMemberDb>, sqlx::Error> {
        sqlx::query_as::<_, GroupMemberDb>(
            "SELECT * FROM group_members WHERE user_id = $1 AND group_id = $2",
        )
        .bind(user_id)
        .bind(group_id)
        .fetch_optional(executor)
        .await
    }

    /// Verifies if a list of users are all members of a specific group.
    pub async fn are_members<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        group_id: Uuid,
        user_ids: &[Uuid],
    ) -> Result<bool, sqlx::Error> {
        // Get number of users that are members of this group
        let count: i64 = sqlx::query_scalar(
            "SELECT count(*) FROM group_members WHERE group_id = $1 AND user_id = ANY($2)",
        )
        .bind(group_id)
        .bind(user_ids)
        .fetch_one(executor)
        .await?;

        // Check if all user_ids provided were within the group
        Ok(count == user_ids.len() as i64)
    }

    pub async fn get_user_groups<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        user_id: Uuid,
    ) -> Result<Vec<GroupDb>, sqlx::Error> {
        sqlx::query_as::<_, GroupDb>(
            "SELECT groups.* FROM groups JOIN group_members ON groups.id = group_members.group_id WHERE group_members.user_id = $1 ORDER BY name",
        )
        .bind(user_id)
        .fetch_all(executor)
        .await
    }

    pub async fn get_members<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        group_id: Uuid,
    ) -> Result<Vec<GroupMemberDetailsDb>, sqlx::Error> {
        sqlx::query_as::<_, GroupMemberDetailsDb>(
            "SELECT users.*, group_members.joined_at, group_members.role FROM group_members JOIN users ON users.id = group_members.user_id WHERE group_members.group_id = $1 ORDER BY name",
        )
        .bind(group_id)
        .fetch_all(executor)
        .await
    }

    pub async fn users_share_group<'e>(
        &self,
        executor: impl PgExecutor<'e, Database = Postgres>,
        user_1_id: Uuid,
        user_2_id: Uuid,
    ) -> Result<bool, sqlx::Error> {
        let exists: bool = sqlx::query_scalar(
            r#"
            SELECT EXISTS (
                SELECT 1
                FROM group_members gm1
                JOIN group_members gm2 ON gm1.group_id = gm2.group_id
                WHERE gm1.user_id = $1 AND gm2.user_id = $2
            )
            "#,
        )
        .bind(user_1_id)
        .bind(user_2_id)
        .fetch_one(executor)
        .await?;

        Ok(exists)
    }
}
