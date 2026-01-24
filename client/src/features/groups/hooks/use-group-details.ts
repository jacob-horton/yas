import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { groupsApi } from "../api";
import { QK_GROUP_DETAILS } from "../constants";

export const useGroupDetails = (id: Accessor<string>) => {
  const getGroupDetails = query(
    async (id) => groupsApi.group(id).get(),
    QK_GROUP_DETAILS,
  );

  return createAsync(() => getGroupDetails(id()));
};
