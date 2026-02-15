import type { Sort } from "@/components/ui/table";

export const groupKeys = {
  all: ["groups"] as const,

  lists: () => [...groupKeys.all, "list"] as const,
  myGroups: () => [...groupKeys.all, "mine"] as const,

  detail: (groupId: string) => [...groupKeys.all, "detail", groupId] as const,
  games: (groupId: string) => [...groupKeys.all, groupId, "games"] as const,
  members: <T extends string>(groupId: string, sort?: Sort<T>) =>
    [...groupKeys.all, groupId, "members", sort] as const,
  invites: (groupId: string) => [...groupKeys.all, groupId, "invites"] as const,
};
