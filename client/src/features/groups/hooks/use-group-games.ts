import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { groupsApi } from "../api";
import { QK_GROUP_GAMES } from "../constants";

export const useGroupGames = (groupId: Accessor<string>) => {
  const getGroupGames = query(async (id) => {
    // TODO: try/catch
    return groupsApi.group(id).games();
  }, QK_GROUP_GAMES);

  return createAsync(() => getGroupGames(groupId()));
};
