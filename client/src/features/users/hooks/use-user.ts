import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { usersApi } from "../api";
import { QK_USER } from "../constants";

export const useUser = (userId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: [QK_USER, userId()],
    queryFn: () => usersApi.user(userId()).get(),
    placeholderData: keepPreviousData,
  }));
};
