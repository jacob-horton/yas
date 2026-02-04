import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { groupsApi } from "../api";
import { QK_GROUP_DETAILS } from "../constants";

export const useGroupDetails = (groupId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: [QK_GROUP_DETAILS, groupId()],
    queryFn: () => groupsApi.group(groupId()).get(),
    placeholderData: keepPreviousData,
  }));
};
