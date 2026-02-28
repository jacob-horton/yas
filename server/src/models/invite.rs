use crate::models::trim_string;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, FromRow)]
pub struct InviteDb {
    pub id: Uuid,
    pub group_id: Uuid,
    pub name: String,

    pub created_by: Uuid,

    pub max_uses: Option<i32>,
    pub uses: i32,

    pub email_whitelist: Vec<String>,

    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, FromRow)]
pub struct InviteWithCreatedByNameDb {
    pub id: Uuid,
    pub group_id: Uuid,
    pub name: String,

    pub created_by: Uuid,
    pub created_by_name: String,

    pub max_uses: Option<i32>,
    pub uses: i32,

    pub email_whitelist: Vec<String>,

    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct InviteSummaryResponse {
    pub id: Uuid,
    pub created_by_name: String,
    pub name: String,

    pub max_uses: Option<i32>,
    pub uses: i32,

    pub email_whitelist: Vec<String>,

    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

impl From<InviteWithCreatedByNameDb> for InviteSummaryResponse {
    fn from(invite: InviteWithCreatedByNameDb) -> Self {
        Self {
            id: invite.id,
            created_by_name: invite.created_by_name,
            name: invite.name,

            max_uses: invite.max_uses,
            uses: invite.uses,

            email_whitelist: invite.email_whitelist,

            created_at: invite.created_at,
            expires_at: invite.expires_at,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct InviteBasicResponse {
    pub id: Uuid,
    pub created_by: String,
    pub name: String,

    pub max_uses: Option<i32>,
    pub uses: i32,

    pub email_whitelist: Vec<String>,

    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

impl From<InviteDb> for InviteBasicResponse {
    fn from(invite: InviteDb) -> Self {
        Self {
            id: invite.id,
            created_by: invite.created_by.to_string(),
            name: invite.name,

            max_uses: invite.max_uses,
            uses: invite.uses,

            email_whitelist: invite.email_whitelist,

            created_at: invite.created_at,
            expires_at: invite.expires_at,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct InviteDetailResponse {
    pub id: Uuid,
    pub created_by_name: String,
    pub expires_at: DateTime<Utc>,

    pub group_id: Uuid,
    pub group_name: String,

    pub is_current_user_member: bool,
}

// Hack to validate emails in a vec (validator doesn't support this yet https://github.com/Keats/validator/issues/353)
#[derive(Debug, Deserialize, Validate)]
#[serde(transparent)]
pub struct ValidEmail {
    #[validate(email(message = "Invalid email format"))]
    pub address: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateInviteReq {
    #[validate(length(min = 3, max = 50, message = "Name must be between 3 and 50 chars"))]
    #[serde(deserialize_with = "trim_string")]
    pub name: String,

    pub expires_at: Option<String>,

    #[validate(range(min = 1, message = "Must be able to use an invite at least once"))]
    pub max_uses: Option<i32>,

    #[validate(nested)]
    pub email_whitelist: Vec<ValidEmail>,
}
