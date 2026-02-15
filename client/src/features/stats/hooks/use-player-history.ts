import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { gamesApi } from "@/features/games/api";
import { statsKeys } from "./query-keys";

export const usePlayerHistory = (
  gameId: Accessor<string>,
  playerId: Accessor<string>,
) => {
  return useQuery(() => ({
    queryKey: statsKeys.playerHistory(gameId(), playerId()),
    queryFn: () => gamesApi.game(gameId()).stats().getPlayerHistory(playerId()),
    placeholderData: keepPreviousData,
  }));
};
