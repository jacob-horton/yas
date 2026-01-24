use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::{FromRow, types::Uuid};

#[derive(Debug, FromRow)]
pub struct InviteDb {
    pub id: Uuid,
    pub group_id: Uuid,

    pub created_by: Uuid,

    pub max_uses: Option<i32>,
    pub uses: i32,

    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct InviteSummaryResponse {
    pub id: String,
    pub created_by: String,

    pub max_uses: Option<i32>,
    pub uses: i32,

    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

impl From<InviteDb> for InviteSummaryResponse {
    fn from(invite: InviteDb) -> Self {
        Self {
            id: invite.id.to_string(),
            created_by: invite.created_by.to_string(),

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
