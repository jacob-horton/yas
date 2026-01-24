import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { groupsApi } from "../api";
import { QK_GROUP_INVITES } from "../constants";

export const useGroupInvites = (id: Accessor<string>) => {
  const getGroupInvites = query(
    async (id) => groupsApi.group(id).invites(),
    QK_GROUP_INVITES,
  );

  return createAsync(() => getGroupInvites(id()));
};
