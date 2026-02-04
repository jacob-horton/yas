import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { gamesApi } from "@/features/games/api";
import { QK_PLAYER_SUMMARY } from "../constants";

export const usePlayerSummary = (
  gameId: Accessor<string>,
  playerId: Accessor<string>,
) => {
  return useQuery(() => ({
    queryKey: [QK_PLAYER_SUMMARY, gameId(), playerId()],
    queryFn: () => gamesApi.game(gameId()).stats().getPlayerSummary(playerId()),
    placeholderData: keepPreviousData,
  }));
};
