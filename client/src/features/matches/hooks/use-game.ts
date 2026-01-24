import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { gamesApi } from "@/features/games/api";
import { QK_GAME } from "@/features/games/constants";

export const useGame = (id: Accessor<string>) => {
  const getGame = query(async (id) => {
    // TODO: try/catch
    return gamesApi.game(id).get();
  }, QK_GAME);

  return createAsync(() => getGame(id()));
};
