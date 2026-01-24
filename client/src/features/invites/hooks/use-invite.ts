import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { invitesApi } from "../api";
import { QK_INVITES } from "../constants";

export const useInvite = (id: Accessor<string>) => {
  const getInvite = query(async (id) => {
    return invitesApi.invite(id).get();
  }, QK_INVITES);

  return createAsync(() => getInvite(id()));
};
