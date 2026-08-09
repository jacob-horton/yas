import type { RoutePreloadFuncArgs } from "@solidjs/router";
import { queryClient } from "@/lib/query-client";
import { gamesApi } from "../games/api";
import { seasonSessionKey } from "../games/seasons";
import { statsKeys } from "./hooks/query-keys";

export function preloadPlayerStats({ params }: RoutePreloadFuncArgs) {
  // Skip if empty
  if (!params.gameId || !params.playerId) {
    return;
  }

  const season = window.sessionStorage.getItem(seasonSessionKey(params.gameId));

  return _preloadPlayerStats(
    params.gameId,
    params.playerId,
    season ?? undefined,
  );
}

function _preloadPlayerStats(
  gameId: string,
  playerId: string,
  season?: string,
) {
  return Promise.all([
    queryClient.prefetchQuery({
      queryKey: statsKeys.playerHistory(gameId, playerId, season),
      queryFn: () =>
        gamesApi.game(gameId).stats().getPlayerHistory(playerId, season),
      staleTime: 1000 * 60 * 1, // 1 min
    }),

    queryClient.prefetchQuery({
      queryKey: statsKeys.playerHighlights(gameId, playerId, season),
      queryFn: () =>
        gamesApi.game(gameId).stats().getPlayerHighlights(playerId, season),
      staleTime: 1000 * 60 * 1, // 1 min
    }),
  ]);
}
