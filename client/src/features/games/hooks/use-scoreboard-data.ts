import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { gamesApi } from "../api";
import { QK_SCOREBOARD } from "../constants";

export const useScoreboardData = (gameId: Accessor<string>) => {
  const getScoreboardData = query(async (gameId) => {
    return gamesApi.game(gameId).getScoreboard();
  }, QK_SCOREBOARD);

  return createAsync(() => getScoreboardData(gameId()));
};
