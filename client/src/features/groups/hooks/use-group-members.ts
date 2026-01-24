import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { groupsApi } from "../api";
import { QK_GROUP_MEMBERS } from "../constants";

export const useGroupMembers = (id: Accessor<string>) => {
  const getGroupMembers = query(
    async (id) => groupsApi.group(id).members(),
    QK_GROUP_MEMBERS,
  );

  return createAsync(() => getGroupMembers(id()));
};
