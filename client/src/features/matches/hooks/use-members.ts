import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { groupsApi } from "@/features/groups/api";
import { QK_GROUP_MEMBERS } from "@/features/groups/constants";

export const useMembers = (groupId: Accessor<string>) => {
  const getMembers = query(async (groupId) => {
    // TODO: try/catch
    return groupsApi.group(groupId).members();
  }, QK_GROUP_MEMBERS);

  return createAsync(() => getMembers(groupId()));
};
