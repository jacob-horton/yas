import { createAsync, query } from "@solidjs/router";
import { usersApi } from "../api";
import { QK_ME } from "../constants";

export const useMe = () => {
  const getMe = query(async () => {
    // TODO: try/catch
    return await usersApi.me();
  }, QK_ME);

  return createAsync(() => getMe());
};
