use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, types::Uuid};
use validator::Validate;

#[derive(Debug, FromRow)]
pub struct InviteDb {
    pub id: Uuid,
    pub group_id: Uuid,
    pub name: String,

    pub created_by: Uuid,
    pub created_by_name: String,

    pub max_uses: Option<i32>,
    pub uses: i32,

    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct InviteSummaryResponse {
    pub id: String,
    pub created_by_name: String,
    pub name: String,

    pub max_uses: Option<i32>,
    pub uses: i32,

    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

impl From<InviteDb> for InviteSummaryResponse {
    fn from(invite: InviteDb) -> Self {
        Self {
            id: invite.id.to_string(),
            created_by_name: invite.created_by_name.to_string(),
            name: invite.name,

            max_uses: invite.max_uses,
            uses: invite.uses,

            created_at: invite.created_at,
            expires_at: invite.expires_at,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct InviteDetailResponse {
    pub id: String,
    pub created_by_name: String,
    pub expires_at: DateTime<Utc>,

    pub group_id: String,
    pub group_name: String,

    pub is_current_user_member: bool,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateInviteReq {
    #[validate(length(min = 3, max = 50, message = "Name must be between 3 and 50 chars"))]
    pub name: String,

    pub expires_at: Option<String>,

    #[validate(range(min = 1, message = "Must be able to use an invite at least once"))]
    pub max_uses: Option<i32>,
}
