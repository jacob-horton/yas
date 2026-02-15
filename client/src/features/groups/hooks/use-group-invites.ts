import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { groupsApi } from "../api";
import { groupKeys } from "./query-keys";

export const useGroupInvites = (groupId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: groupKeys.invites(groupId()),
    queryFn: () => groupsApi.group(groupId()).invites(),
    placeholderData: keepPreviousData,
  }));
};
