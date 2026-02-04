import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { gamesApi } from "@/features/games/api";
import { QK_PLAYER_HISTORY } from "../constants";

export const usePlayerHistory = (
  gameId: Accessor<string>,
  playerId: Accessor<string>,
) => {
  return useQuery(() => ({
    queryKey: [QK_PLAYER_HISTORY, gameId(), playerId()],
    queryFn: () => gamesApi.game(gameId()).stats().getPlayerHistory(playerId()),
    placeholderData: keepPreviousData,
  }));
};
