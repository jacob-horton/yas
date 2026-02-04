import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { groupsApi } from "../api";
import { QK_GROUP_INVITES } from "../constants";

export const useGroupInvites = (groupId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: [QK_GROUP_INVITES, groupId()],
    queryFn: () => groupsApi.group(groupId()).invites(),
    placeholderData: keepPreviousData,
  }));
};
