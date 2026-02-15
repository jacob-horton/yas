import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import { groupKeys } from "@/features/groups/hooks/query-keys";
import { usersApi } from "../api";

export const useMyGroups = () => {
  return useQuery(() => ({
    queryKey: groupKeys.myGroups(),
    queryFn: () => usersApi.myGroups(),
    placeholderData: keepPreviousData,
  }));
};
