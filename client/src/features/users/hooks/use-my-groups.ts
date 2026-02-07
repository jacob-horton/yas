import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import { usersApi } from "../api";
import { QK_MY_GROUPS } from "../constants";

export const useMyGroups = () => {
  return useQuery(() => ({
    queryKey: [QK_MY_GROUPS],
    queryFn: () => usersApi.myGroups(),
    placeholderData: keepPreviousData,
  }));
};
