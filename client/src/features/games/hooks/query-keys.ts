import type { Sort } from "@/components/ui/table";

export const gameKeys = {
  all: ["games"] as const,

  game: (gameId: string) => [...gameKeys.all, gameId] as const,

  lastPLayers: (gameId: string) =>
    [...gameKeys.game(gameId), "last_players"] as const,

  scoreboard: <T extends string>(gameId: string, sort?: Sort<T>) => {
    if (sort) {
      return [...gameKeys.game(gameId), "scoreboard", sort] as const;
    }

    return [...gameKeys.game(gameId), "scoreboard"] as const;
  },
};
