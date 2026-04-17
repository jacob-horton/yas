import { queryClient } from "@/lib/query-client";
import { gamesApi } from "../games/api";
import { statsKeys } from "./hooks/query-keys";

export function preloadPlayerStats({
  params,
}: {
  params: { gameId?: string; playerId?: string };
}) {
  // Skip if empty
  if (!params.gameId || !params.playerId) {
    return;
  }

  return _preloadPlayerStats(params.gameId, params.playerId);
}

function _preloadPlayerStats(gameId: string, playerId: string) {
  return Promise.all([
    queryClient.prefetchQuery({
      queryKey: statsKeys.playerHistory(gameId, playerId),
      queryFn: () => gamesApi.game(gameId).stats().getPlayerHistory(playerId),
      staleTime: 1000 * 60 * 1, // 1 min
    }),

    queryClient.prefetchQuery({
      queryKey: statsKeys.playerHighlights(gameId, playerId),
      queryFn: () =>
        gamesApi.game(gameId).stats().getPlayerHighlights(playerId),
      staleTime: 1000 * 60 * 1, // 1 min
    }),
  ]);
}
