import { createAsync, query } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { gamesApi } from "@/features/games/api";
import { QK_PLAYER_SUMMARY } from "../constants";

export const usePlayerSummary = (
  gameId: Accessor<string>,
  playerId: Accessor<string>,
) => {
  const getPlayerSummary = query(async (gameId, playerId) => {
    return gamesApi.game(gameId).stats().getPlayerSummary(playerId);
  }, QK_PLAYER_SUMMARY);

  return createAsync(() => getPlayerSummary(gameId(), playerId()));
};
