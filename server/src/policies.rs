use crate::models::group::GroupMemberRole;

pub enum GroupAction {
    CreateInvite,
    DeleteInvite,
    CreateGame,
    CreateMatch,
    RemoveMember(GroupMemberRole),
}
