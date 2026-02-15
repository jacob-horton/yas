import type { AvatarColour, AvatarIcon } from "@/components/ui/avatar";

export type Group = {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  my_role: MemberRole;
};

export const MEMBER_ROLES = ["viewer", "member", "admin", "owner"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export type GroupMember = {
  id: string;
  name: string;
  email?: string;
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
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
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

export type UpdateGroupRequest = {
  name: string;
};
