import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { gamesApi } from "@/features/games/api";
import { QK_PLAYER_HIGHLIGHTS } from "../constants";

export const usePlayerHighlights = (
  gameId: Accessor<string>,
  playerId: Accessor<string>,
) => {
  return useQuery(() => ({
    queryKey: [QK_PLAYER_HIGHLIGHTS, gameId(), playerId()],
    queryFn: () =>
      gamesApi.game(gameId()).stats().getPlayerHighlights(playerId()),
    placeholderData: keepPreviousData,
  }));
};
