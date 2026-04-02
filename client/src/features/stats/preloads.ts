import { queryClient } from "@/lib/query-client";
import { gamesApi } from "../games/api";
import { statsKeys } from "./hooks/query-keys";

export const preloadPlayerStats = ({
  params,
}: {
  params: { gameId: string; playerId: string };
}) => {
  queryClient.prefetchQuery({
    queryKey: statsKeys.playerHistory(params.gameId, params.playerId),
    queryFn: () =>
      gamesApi.game(params.gameId).stats().getPlayerHistory(params.playerId),
  });

  queryClient.prefetchQuery({
    queryKey: statsKeys.playerHighlights(params.gameId, params.playerId),
    queryFn: () =>
      gamesApi.game(params.gameId).stats().getPlayerHighlights(params.playerId),
  });
};
