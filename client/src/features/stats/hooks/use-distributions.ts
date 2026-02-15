import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { gamesApi } from "@/features/games/api";
import { statsKeys } from "./query-keys";

export const useDistributions = (gameId: Accessor<string>) => {
  return useQuery(() => ({
    queryKey: statsKeys.distributions(gameId()),
    queryFn: () => gamesApi.game(gameId()).stats().getDistributions(),
    placeholderData: keepPreviousData,
  }));
};
