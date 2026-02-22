import { z } from "zod";
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

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Must be at least 3 characters")
    .max(50, "Cannot exceed 50 characters"),
});
export type CreateGroupRequest = z.output<typeof createGroupSchema>;

export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

export function hasPermission(
  myRole: MemberRole | undefined,
  targetRole: MemberRole,
  verified: boolean | undefined,
  strict = false,
) {
  if (!myRole || !verified) return false;

  const myLevel = ROLE_HIERARCHY[myRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];

  return verified && (strict ? myLevel > targetLevel : myLevel >= targetLevel);
}

export const updateGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Must be at least 3 characters")
    .max(50, "Cannot exceed 50 characters"),
});
export type UpdateGroupRequest = z.output<typeof createGroupSchema>;
