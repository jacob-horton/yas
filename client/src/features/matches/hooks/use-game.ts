import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { gamesApi } from "@/features/games/api";
import { gameKeys } from "@/features/games/hooks/query-keys";

export const useGame = (gameId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: gameKeys.game(gameId()),
    queryFn: () => gamesApi.game(gameId()).get(),
    placeholderData: keepPreviousData,
  }));
};
