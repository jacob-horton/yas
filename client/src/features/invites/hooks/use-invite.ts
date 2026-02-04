import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { invitesApi } from "../api";
import { QK_INVITES } from "../constants";

export const useInvite = (inviteId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: [QK_INVITES, inviteId()],
    queryFn: () => invitesApi.invite(inviteId()).get(),
    placeholderData: keepPreviousData,
  }));
};
