import { keepPreviousData, useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";
import type { Sort } from "@/components/ui/table";
import { gamesApi } from "../../games/api";
import { QK_SCOREBOARD } from "../../games/constants";

export const useScoreboardData = <T extends string>(
  gameId: Accessor<string>,
  sort: Accessor<Sort<T> | undefined>,
) => {
  return useQuery(() => ({
    queryKey: [QK_SCOREBOARD, gameId(), sort()],
    queryFn: async () => gamesApi.game(gameId()).stats().getScoreboard(sort()),
    placeholderData: keepPreviousData,
  }));
};
