import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { invitesApi } from "../api";
import { inviteKeys } from "./query-keys";

export const useInvite = (inviteId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: inviteKeys.invite(inviteId()),
    queryFn: () => invitesApi.invite(inviteId()).get(),
    placeholderData: keepPreviousData,
  }));
};
