import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { gamesApi } from "@/features/games/api";
import { QK_DISTRIBUTIONS } from "../constants";

export const useDistributions = (gameId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: [QK_DISTRIBUTIONS, gameId()],
    queryFn: () => gamesApi.game(gameId()).stats().getDistributions(),
    placeholderData: keepPreviousData,
  }));
};
