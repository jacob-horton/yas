import type { Sort } from "@/components/ui/table";

export const groupKeys = {
  all: ["groups"] as const,

  lists: () => [...groupKeys.all, "list"] as const,
  myGroups: () => [...groupKeys.all, "mine"] as const,

  detail: (groupId: string) => [...groupKeys.all, groupId] as const,

  games: (groupId: string) => [...groupKeys.detail(groupId), "games"] as const,

  invites: (groupId: string) =>
    [...groupKeys.detail(groupId), "invites"] as const,

  members: <T extends string>(groupId: string, sort?: Sort<T>) => {
    if (sort) {
      return [...groupKeys.detail(groupId), "members", sort] as const;
    }

    return [...groupKeys.detail(groupId), "members"] as const;
  },
};
