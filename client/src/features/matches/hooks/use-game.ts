import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { gamesApi } from "@/features/games/api";
import { QK_GAME } from "@/features/games/constants";

export const useGame = (gameId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: [QK_GAME, gameId()],
    queryFn: () => gamesApi.game(gameId()).get(),
    placeholderData: keepPreviousData,
  }));
};
