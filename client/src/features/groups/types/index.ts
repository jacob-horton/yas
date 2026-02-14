import type { AvatarColour, AvatarIcon } from "@/components/ui/avatar";

export type Group = {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  my_role: MemberRole;
};

export const MEMBER_ROLES = ["member", "admin", "owner"];
export type MemberRole = (typeof MEMBER_ROLES)[number];

export type GroupMember = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  joined_at: string;
  role: MemberRole;
  avatar: AvatarIcon;
  avatar_colour: AvatarColour;
};

export type CreateGroupRequest = {
  name: string;
};

export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  member: 0,
  admin: 1,
  owner: 2,
};

export function hasPermission(
  myRole: MemberRole | undefined,
  targetRole: MemberRole,
  strict = false,
) {
  if (!myRole) return false;

  const myLevel = ROLE_HIERARCHY[myRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];

  return strict ? myLevel > targetLevel : myLevel >= targetLevel;
}
