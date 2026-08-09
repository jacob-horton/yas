import type { RoutePreloadFunc } from "@solidjs/router";
import { queryClient } from "@/lib/query-client";
import { gamesApi } from "./api";
import { gameKeys } from "./hooks/query-keys";
import { seasonSessionKey } from "./seasons";

export const preloadScoreboard: RoutePreloadFunc = ({ params }) => {
  const gameId = params.gameId;
  if (!gameId) {
    return;
  }

  const season = window.sessionStorage.getItem(seasonSessionKey(gameId));

  queryClient.prefetchQuery({
    queryKey: gameKeys.gameSeasons(gameId),
    queryFn: () => gamesApi.game(gameId).seasons(),
  });

  queryClient.prefetchQuery({
    queryKey: gameKeys.scoreboard(gameId, season ?? undefined, undefined),
    queryFn: () =>
      gamesApi
        .game(gameId)
        .stats()
        .getScoreboard(season ?? undefined),
  });
};

export const preloadEditGame: RoutePreloadFunc = ({ params }) => {
  const gameId = params.gameId;
  if (!gameId) {
    return;
  }

  queryClient.prefetchQuery({
    queryKey: gameKeys.gameSeasons(gameId),
    queryFn: () => gamesApi.game(gameId).seasons(),
  });

  queryClient.prefetchQuery({
    queryKey: gameKeys.game(gameId),
    queryFn: () => gamesApi.game(gameId).get(),
  });
};
