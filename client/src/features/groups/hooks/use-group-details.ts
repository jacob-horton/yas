import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { groupsApi } from "../api";

const QK_GROUP_DETAILS = "group_details";

export const useGroupDetails = (id: Accessor<string>) => {
  const getGroupDetails = query(
    async (id) => groupsApi.group(id).get(),
    QK_GROUP_DETAILS,
  );

  return createAsync(() => getGroupDetails(id()));
};
