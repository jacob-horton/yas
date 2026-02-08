import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import type { Sort } from "@/components/ui/table";
import { groupsApi } from "../api";
import { QK_GROUP_MEMBERS } from "../constants";

export const useGroupMembers = <T extends string>(
  groupId: Accessor<string>,
  sort?: Accessor<Sort<T>>,
) => {
  return useQuery(() => ({
    queryKey: [QK_GROUP_MEMBERS, groupId(), sort?.()],
    queryFn: () => groupsApi.group(groupId()).members(sort?.()),
    placeholderData: keepPreviousData,
  }));
};
