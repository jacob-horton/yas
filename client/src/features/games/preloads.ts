import type { RoutePreloadFunc } from "@solidjs/router";
import { queryClient } from "@/lib/query-client";
import { gamesApi } from "./api";
import { gameKeys } from "./hooks/query-keys";

export const preloadScoreboard: RoutePreloadFunc = ({ params }) => {
  queryClient.prefetchQuery({
    queryKey: gameKeys.scoreboard(params.gameId, undefined),
    queryFn: () =>
      gamesApi.game(params.gameId).stats().getScoreboard(undefined),
  });
};

export const preloadEditGame: RoutePreloadFunc = ({ params }) => {
  queryClient.prefetchQuery({
    queryKey: gameKeys.game(params.gameId),
    queryFn: () => gamesApi.game(params.gameId).get(),
  });
};
