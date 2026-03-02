use crate::models::trim_string;
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
            (GroupMemberRole::Admin, GroupAction::ViewInvites) => true,
            (GroupMemberRole::Admin, GroupAction::CreateMatch) => true,
            (GroupMemberRole::Admin, GroupAction::CreateGame) => true,
            (GroupMemberRole::Admin, GroupAction::UpdateGame) => true,
            (GroupMemberRole::Admin, GroupAction::DeleteGame) => true,
            (GroupMemberRole::Admin, GroupAction::UpdateGroup) => true,
            (GroupMemberRole::Admin, GroupAction::RemoveMember(GroupMemberRole::Member)) => true,
            (GroupMemberRole::Admin, GroupAction::RemoveMember(GroupMemberRole::Viewer)) => true,
            (GroupMemberRole::Admin, GroupAction::ViewEmails) => true,

            // Admins can update roles with restrictions:
            // 1. Cannot modify an existing Owner or Admin
            // 2. Cannot promote anyone to Owner
            (GroupMemberRole::Admin, GroupAction::UpdateRole(current_role, new_role))
                if !matches!(
                    current_role,
                    GroupMemberRole::Owner | GroupMemberRole::Admin
                ) && !matches!(new_role, GroupMemberRole::Owner) =>
            {
                true
            }

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
    #[serde(deserialize_with = "trim_string")]
    pub name: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateGroupReq {
    #[validate(length(min = 3, max = 50, message = "Name must be between 3 and 50 chars"))]
    #[serde(deserialize_with = "trim_string")]
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::group::GroupMemberRole::*;

    #[test]
    fn test_owner_powers() {
        let role = Owner;

        // Owners should be able to do anything, even destructive group actions
        assert!(role.can_perform(GroupAction::DeleteGroup));
        assert!(role.can_perform(GroupAction::UpdateRole(Admin, Owner)));
    }

    #[test]
    fn test_admin_restrictions() {
        let admin = Admin;

        // Valid Admin actions
        assert!(admin.can_perform(GroupAction::CreateInvite));
        assert!(admin.can_perform(GroupAction::RemoveMember(Member)));

        // Admins CANNOT promote someone to Owner
        assert!(!admin.can_perform(GroupAction::UpdateRole(Member, Owner)));

        // Admins CANNOT demote/remove other Admins
        assert!(!admin.can_perform(GroupAction::UpdateRole(Admin, Member)));
        assert!(!admin.can_perform(GroupAction::RemoveMember(Admin)));

        // Admins CANNOT delete the group
        assert!(!admin.can_perform(GroupAction::DeleteGroup));
    }

    #[test]
    fn test_member_restrictions() {
        let member = Member;

        assert!(member.can_perform(GroupAction::CreateMatch));

        // Members cannot do admin stuff
        assert!(!member.can_perform(GroupAction::CreateGame));
        assert!(!member.can_perform(GroupAction::CreateInvite));
        assert!(!member.can_perform(GroupAction::RemoveMember(Viewer)));
    }

    #[test]
    fn test_owner_is_god_mode() {
        let roles = [Owner, Admin, Member, Viewer];
        for current_role in roles {
            for target_role in roles {
                // Owner can change anyone to anything
                assert!(Owner.can_perform(GroupAction::UpdateRole(current_role, target_role)));
                // Owner can remove anyone
                assert!(Owner.can_perform(GroupAction::RemoveMember(target_role)));
            }
        }
        assert!(Owner.can_perform(GroupAction::DeleteGroup));
    }

    #[test]
    fn test_admin_role_promotion_logic() {
        let admin = Admin;

        // ✅ Admin can promote Member -> Admin
        assert!(admin.can_perform(GroupAction::UpdateRole(Member, Admin)));

        // ✅ Admin can promote Viewer -> Admin
        assert!(admin.can_perform(GroupAction::UpdateRole(Viewer, Admin)));

        // ❌ Admin CANNOT promote anyone to Owner
        assert!(!admin.can_perform(GroupAction::UpdateRole(Member, Owner)));
        assert!(!admin.can_perform(GroupAction::UpdateRole(Admin, Owner)));

        // ❌ Admin CANNOT touch an existing Owner's role
        assert!(!admin.can_perform(GroupAction::UpdateRole(Owner, Admin)));
        assert!(!admin.can_perform(GroupAction::UpdateRole(Owner, Member)));
    }

    #[test]
    fn test_admin_role_demotion_logic() {
        let admin = Admin;

        // ❌ Admin CANNOT demote another Admin
        assert!(!admin.can_perform(GroupAction::UpdateRole(Admin, Member)));
        assert!(!admin.can_perform(GroupAction::UpdateRole(Admin, Viewer)));

        // ✅ Admin CAN demote a Member to Viewer
        assert!(admin.can_perform(GroupAction::UpdateRole(Member, Viewer)));
    }

    #[test]
    fn test_admin_removal_logic() {
        let admin = Admin;

        // ✅ Admin can kick lower ranks
        assert!(admin.can_perform(GroupAction::RemoveMember(Member)));
        assert!(admin.can_perform(GroupAction::RemoveMember(Viewer)));

        // ❌ Admin CANNOT kick other Admins or the Owner
        assert!(!admin.can_perform(GroupAction::RemoveMember(Admin)));
        assert!(!admin.can_perform(GroupAction::RemoveMember(Owner)));
    }

    #[test]
    fn test_viewer_is_read_only() {
        let viewer = Viewer;

        // Viewers should fail every single mutating action
        assert!(!viewer.can_perform(GroupAction::CreateMatch));
        assert!(!viewer.can_perform(GroupAction::CreateInvite));
        assert!(!viewer.can_perform(GroupAction::UpdateGroup));
        assert!(!viewer.can_perform(GroupAction::CreateGame));
    }

    #[test]
    fn test_member_limited_mutation() {
        let member = Member;

        // ✅ The one specific thing a member can do
        assert!(member.can_perform(GroupAction::CreateMatch));

        // ❌ Cannot do anything else
        assert!(!member.can_perform(GroupAction::CreateGame));
        assert!(!member.can_perform(GroupAction::DeleteInvite));
    }
}
