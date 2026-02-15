use crate::models::group::GroupMemberRole;

pub enum GroupAction {
    CreateInvite,
    DeleteInvite,
    CreateGame,
    UpdateGame,
    CreateMatch,
    RemoveMember(GroupMemberRole),
    UpdateRole(GroupMemberRole, GroupMemberRole), // (From, To)
    ViewEmails,
}
