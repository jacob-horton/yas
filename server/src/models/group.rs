use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, prelude::Type};
use uuid::Uuid;
use validator::Validate;

use crate::{
    models::{
        stats::OrderDir,
        user::{Avatar, AvatarColour},
    },
    policies::GroupAction,
};

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

#[derive(Debug, FromRow)]
pub struct GroupMemberDetailsDb {
    pub id: Uuid,
    pub role: GroupMemberRole,
    pub email: String,
    pub name: String,
    pub joined_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub avatar: Avatar,
    pub avatar_colour: AvatarColour,
}

#[derive(Debug, Serialize, Deserialize, Type, PartialEq, Eq)]
#[sqlx(type_name = "user_role", rename_all = "lowercase")]
#[serde(rename_all = "lowercase")]
pub enum GroupMemberRole {
    Member,
    Admin,
    Owner,
}

impl GroupMemberRole {
    pub fn can_perform(&self, action: GroupAction) -> bool {
        match (self, action) {
            // Owners can do everything
            (GroupMemberRole::Owner, _) => true,

            // Admin only actions
            (GroupMemberRole::Admin, GroupAction::CreateInvite) => true,
            (GroupMemberRole::Admin, GroupAction::DeleteInvite) => true,
            (GroupMemberRole::Admin, GroupAction::CreateMatch) => true,
            (GroupMemberRole::Admin, GroupAction::CreateGame) => true,
            (GroupMemberRole::Admin, GroupAction::RemoveMember(GroupMemberRole::Member)) => true,

            // Deny everything else
            _ => false,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct GroupResponse {
    pub id: String,
    pub name: String,
    pub created_at: String,
}

impl From<GroupDb> for GroupResponse {
    fn from(group: GroupDb) -> Self {
        Self {
            id: group.id.to_string(),
            name: group.name,
            created_at: group.created_at.to_rfc3339(),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct GroupMemberResponse {
    pub id: String,
    pub email: String,
    pub name: String,
    pub created_at: String,
    pub joined_at: String,
    pub role: GroupMemberRole,
    pub avatar: Avatar,
    pub avatar_colour: AvatarColour,
}

impl From<GroupMemberDetailsDb> for GroupMemberResponse {
    fn from(group_member: GroupMemberDetailsDb) -> Self {
        Self {
            id: group_member.id.to_string(),
            email: group_member.email,
            name: group_member.name,
            created_at: group_member.created_at.to_rfc3339(),
            joined_at: group_member.joined_at.to_rfc3339(),
            role: group_member.role,
            avatar: group_member.avatar,
            avatar_colour: group_member.avatar_colour,
        }
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateGroupReq {
    #[validate(length(min = 3, max = 50, message = "Name must be between 3 and 50 chars"))]
    pub name: String,
}

#[derive(Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum OrderBy {
    Name,
    Email,
    Role,
    JoinedAt,
}

#[derive(Deserialize)]
pub struct GroupMembersParams {
    pub order_by: Option<OrderBy>,
    pub order_dir: Option<OrderDir>,
}
