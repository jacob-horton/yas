import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import type { Sort } from "@/components/ui/table";
import { gamesApi } from "../../games/api";
import { QK_SCOREBOARD } from "../../games/constants";

export const useScoreboardData = <T extends string>(
  gameId: Accessor<string>,
  sort: Accessor<Sort<T>>,
) => {
  const getScoreboardData = query(async (gameId, sort) => {
    return gamesApi.game(gameId).stats().getScoreboard(sort);
  }, QK_SCOREBOARD);

  return createAsync(() => getScoreboardData(gameId(), sort()));
};
