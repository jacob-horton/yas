use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, prelude::Type, types::Uuid};
use validator::Validate;

#[derive(Debug, FromRow)]
pub struct GroupDb {
    pub id: Uuid,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, FromRow)]
pub struct GroupMemberDb {
    pub group_id: Uuid,
    pub user_id: Uuid,
    pub role: GroupMemberRole,
}

#[derive(Debug, Serialize, Deserialize, Type, PartialEq, Eq)]
#[sqlx(type_name = "user_role", rename_all = "lowercase")]
pub enum GroupMemberRole {
    Member,
    Admin,
    Owner,
}

#[derive(Debug, Serialize)]
pub struct GroupResponse {
    pub id: String,
    pub name: String,
    pub created_at: String,
}

impl From<GroupDb> for GroupResponse {
    fn from(user: GroupDb) -> Self {
        Self {
            id: user.id.to_string(),
            name: user.name,
            created_at: user.created_at.to_rfc3339(),
        }
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateGroupReq {
    #[validate(length(min = 3, max = 50, message = "Name must be between 3 and 50 chars"))]
    pub name: String,
}
