import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { gamesApi } from "@/features/games/api";
import { gameKeys } from "@/features/games/hooks/query-keys";

export const useGameSeasons = (gameId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: gameKeys.gameSeasons(gameId()),
    queryFn: () => gamesApi.game(gameId()).seasons(),
    placeholderData: keepPreviousData,
  }));
};
