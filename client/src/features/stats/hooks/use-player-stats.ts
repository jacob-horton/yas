import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { gamesApi } from "@/features/games/api";
import { QK_PLAYER_STATS } from "../constants";

export const usePlayerStats = (
  gameId: Accessor<string>,
  playerId: Accessor<string>,
) => {
  const getPlayerStats = query(async (gameId, playerId) => {
    return gamesApi.game(gameId).stats().getPlayerStats(playerId);
  }, QK_PLAYER_STATS);

  return createAsync(() => getPlayerStats(gameId(), playerId()));
};
