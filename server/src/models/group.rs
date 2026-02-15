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
    pub created_by: Uuid,
}

#[derive(Debug, FromRow)]
pub struct GroupWithRole {
    pub id: Uuid,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub created_by: Uuid,
    pub my_role: GroupMemberRole,
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

#[derive(Clone, Copy, Debug, Serialize, Deserialize, Type, PartialEq, Eq)]
#[sqlx(type_name = "user_role", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum GroupMemberRole {
    Viewer,
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
            (GroupMemberRole::Admin, GroupAction::UpdateGame) => true,
            (GroupMemberRole::Admin, GroupAction::UpdateGroup) => true,
            (GroupMemberRole::Admin, GroupAction::RemoveMember(GroupMemberRole::Member)) => true,
            (
                GroupMemberRole::Admin,
                // Admins can promote people to admin, but not demote them
                GroupAction::UpdateRole(
                    GroupMemberRole::Member | GroupMemberRole::Admin,
                    GroupMemberRole::Admin,
                ),
            ) => true,

            // Member actions
            (GroupMemberRole::Member, GroupAction::CreateMatch) => true,

            // Deny everything else
            _ => false,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct GroupResponse {
    pub id: Uuid,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub created_by: Uuid,
}

#[derive(Debug, Serialize)]
pub struct GroupWithRoleResponse {
    pub id: Uuid,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub created_by: Uuid,
    pub my_role: GroupMemberRole,
}

impl From<GroupDb> for GroupResponse {
    fn from(group: GroupDb) -> Self {
        Self {
            id: group.id,
            name: group.name,
            created_at: group.created_at,
            created_by: group.created_by,
        }
    }
}

impl From<GroupWithRole> for GroupWithRoleResponse {
    fn from(group: GroupWithRole) -> Self {
        Self {
            id: group.id,
            name: group.name,
            created_at: group.created_at,
            my_role: group.my_role,
            created_by: group.created_by,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct GroupMemberResponse {
    pub id: Uuid,

    // Only returned for users with sufficient permissions
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,

    pub name: String,
    pub created_at: DateTime<Utc>,
    pub joined_at: DateTime<Utc>,
    pub role: GroupMemberRole,
    pub avatar: Avatar,
    pub avatar_colour: AvatarColour,
}

impl GroupMemberResponse {
    pub fn from_db(member: GroupMemberDetailsDb, viewer_role: GroupMemberRole) -> Self {
        let show_email = viewer_role.can_perform(GroupAction::ViewEmails);

        Self {
            id: member.id,

            // Only set email if user has permission
            email: if show_email { Some(member.email) } else { None },

            name: member.name,
            created_at: member.created_at,
            joined_at: member.joined_at,
            role: member.role,
            avatar: member.avatar,
            avatar_colour: member.avatar_colour,
        }
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateGroupReq {
    #[validate(length(min = 3, max = 50, message = "Name must be between 3 and 50 chars"))]
    pub name: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateGroupReq {
    #[validate(length(min = 3, max = 50, message = "Name must be between 3 and 50 chars"))]
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct SetRoleReq {
    pub role: GroupMemberRole,
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
