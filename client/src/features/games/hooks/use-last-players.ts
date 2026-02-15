import { useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { gamesApi } from "../../games/api";
import { gameKeys } from "./query-keys";

export const useLastPlayers = (gameId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: gameKeys.lastPLayers(gameId()),
    queryFn: () => gamesApi.game(gameId()).lastPlayers(),
    enabled: !!gameId(),
    staleTime: 1000 * 60, // Cache for 1 minute
  }));
};
