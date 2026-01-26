import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { usersApi } from "../api";
import { QK_USER } from "../constants";

export const useUser = (id: Accessor<string>) => {
  const geUser = query(async (id: string) => {
    // TODO: try/catch
    return await usersApi.user(id).get();
  }, QK_USER);

  return createAsync(() => geUser(id()));
};
