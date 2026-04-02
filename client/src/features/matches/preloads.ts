import type { RoutePreloadFunc } from "@solidjs/router";
import { queryClient } from "@/lib/query-client";
import { gamesApi } from "../games/api";
import { gameKeys } from "../games/hooks/query-keys";
import { groupsApi } from "../groups/api";
import { groupKeys } from "../groups/hooks/query-keys";

export const preloadRecordMatch: RoutePreloadFunc = ({ params }) => {
  queryClient.prefetchQuery({
    queryKey: groupKeys.members(params.groupId),
    queryFn: () => groupsApi.group(params.groupId).members(),
  });

  queryClient.prefetchQuery({
    queryKey: gameKeys.game(params.gameId),
    queryFn: () => gamesApi.game(params.gameId).get(),
  });

  queryClient.prefetchQuery({
    queryKey: gameKeys.lastPlayers(params.gameId),
    queryFn: () => gamesApi.game(params.gameId).lastPlayers(),
  });
};
