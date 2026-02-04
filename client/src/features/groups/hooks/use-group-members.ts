import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { groupsApi } from "../api";
import { QK_GROUP_MEMBERS } from "../constants";

export const useGroupMembers = (groupId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: [QK_GROUP_MEMBERS, groupId()],
    queryFn: () => groupsApi.group(groupId()).members(),
    placeholderData: keepPreviousData,
  }));
};
