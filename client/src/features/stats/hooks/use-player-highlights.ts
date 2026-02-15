import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { gamesApi } from "@/features/games/api";
import { statsKeys } from "./query-keys";

export const usePlayerHighlights = (
  gameId: Accessor<string>,
  playerId: Accessor<string>,
) => {
  return useQuery(() => ({
    queryKey: statsKeys.playerHighlights(gameId(), playerId()),
    queryFn: () =>
      gamesApi.game(gameId()).stats().getPlayerHighlights(playerId()),
    placeholderData: keepPreviousData,
  }));
};
