import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { gamesApi } from "@/features/games/api";
import { QK_PLAYER_HISTORY } from "../constants";

export const usePlayerHistory = (
  gameId: Accessor<string>,
  playerId: Accessor<string>,
) => {
  const getPlayerHistory = query(async (gameId, playerId) => {
    return gamesApi.game(gameId).stats().getPlayerHistory(playerId);
  }, QK_PLAYER_HISTORY);

  return createAsync(() => getPlayerHistory(gameId(), playerId()));
};
