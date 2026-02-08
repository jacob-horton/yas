import { useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { gamesApi } from "../../games/api";
import { QK_GAME, QK_LAST_PLAYERS } from "../../games/constants";

export const useLastPlayers = (gameId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: [QK_GAME, gameId(), QK_LAST_PLAYERS],
    queryFn: () => gamesApi.game(gameId()).lastPlayers(),
    enabled: !!gameId(),
    staleTime: 1000 * 60, // Cache for 1 minute
  }));
};
