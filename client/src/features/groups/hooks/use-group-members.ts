import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { groupsApi } from "../api";

const QK_GROUP_MEMBERS = "group_members";

export const useGroupMembers = (id: Accessor<string>) => {
  const getGroupMembers = query(
    async (id) => groupsApi.group(id).members(),
    QK_GROUP_MEMBERS,
  );

  return createAsync(() => getGroupMembers(id()));
};
