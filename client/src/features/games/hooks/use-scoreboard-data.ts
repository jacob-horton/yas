import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import type { Sort } from "@/components/ui/table";
import { gamesApi } from "../../games/api";
import { gameKeys } from "./query-keys";

export const useScoreboardData = <T extends string>(
  gameId: Accessor<string>,
  sort: Accessor<Sort<T> | undefined>,
) => {
  return useQuery(() => ({
    queryKey: gameKeys.scoreboard(gameId(), sort()),
    queryFn: async () => gamesApi.game(gameId()).stats().getScoreboard(sort()),
    placeholderData: keepPreviousData,
  }));
};
