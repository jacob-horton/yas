import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { usersApi } from "../api";
import { userKeys } from "./query-keys";

export const useUser = (userId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: userKeys.user(userId()),
    queryFn: () => usersApi.user(userId()).get(),
    placeholderData: keepPreviousData,
  }));
};
