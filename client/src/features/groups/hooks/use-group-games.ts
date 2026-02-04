import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { groupsApi } from "../api";
import { QK_GROUP_GAMES } from "../constants";

export const useGroupGames = (groupId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: [QK_GROUP_GAMES, groupId()],
    queryFn: () => groupsApi.group(groupId()).games(),
    placeholderData: keepPreviousData,
  }));
};
