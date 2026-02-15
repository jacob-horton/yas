import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { groupsApi } from "../api";
import { groupKeys } from "./query-keys";

export const useGroupGames = (groupId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: groupKeys.games(groupId()),
    queryFn: () => groupsApi.group(groupId()).games(),
    placeholderData: keepPreviousData,
  }));
};
