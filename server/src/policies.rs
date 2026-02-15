use crate::models::group::GroupMemberRole;

pub enum GroupAction {
    CreateInvite,
    DeleteInvite,
    CreateGame,
    UpdateGame,
    UpdateGroup,
    CreateMatch,
    RemoveMember(GroupMemberRole),
    UpdateRole(GroupMemberRole, GroupMemberRole), // (From, To)
    ViewEmails,
}
