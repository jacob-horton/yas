import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import { gamesApi } from "@/features/games/api";
import { statsKeys } from "./query-keys";

export const useDistributions = (
  gameId: Accessor<string>,
  seasonId: Accessor<string | undefined>,
) => {
  return useQuery(() => ({
    queryKey: statsKeys.distributions(gameId(), seasonId()),
    queryFn: () => gamesApi.game(gameId()).stats().getDistributions(seasonId()),
    placeholderData: keepPreviousData,
  }));
};
