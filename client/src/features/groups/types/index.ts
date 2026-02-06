export type Group = {
  id: string;
  name: string;
  created_at: string;
};

export type MemberRole = "member" | "admin" | "owner";

export type GroupMember = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  joined_at: string;
  role: MemberRole;
};

export type CreateGroupRequest = {
  name: string;
};
