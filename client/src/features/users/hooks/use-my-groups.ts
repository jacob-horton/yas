import { createAsync, query } from "@solidjs/router";
import { usersApi } from "../api";
import { QK_MY_GROUPS } from "../constants";

export const useMyGroups = () => {
  const getGroups = query(async () => {
    // TODO: try/catch
    return await usersApi.myGroups();
  }, QK_MY_GROUPS);

  return createAsync(() => getGroups());
};
