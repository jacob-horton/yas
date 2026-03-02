use crate::models::group::GroupMemberRole;

pub enum GroupAction {
    CreateInvite,
    DeleteInvite,
    ViewInvites,
    CreateGame,
    UpdateGame,
    DeleteGame,
    UpdateGroup,
    DeleteGroup,
    CreateMatch,
    RemoveMember(GroupMemberRole),
    UpdateRole(GroupMemberRole, GroupMemberRole), // (From, To)
    ViewEmails,
}
