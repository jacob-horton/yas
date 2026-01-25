import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { gamesApi } from "../../games/api";
import { QK_SCOREBOARD } from "../../games/constants";

export const useScoreboardData = (gameId: Accessor<string>) => {
  const getScoreboardData = query(async (gameId) => {
    return gamesApi.game(gameId).stats().getScoreboard();
  }, QK_SCOREBOARD);

  return createAsync(() => getScoreboardData(gameId()));
};
