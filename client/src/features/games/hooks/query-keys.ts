import type { Sort } from "@/components/ui/table";

export const gameKeys = {
  all: ["games"] as const,

  game: (gameId: string) => [...gameKeys.all, gameId] as const,

  gameSeasons: (gameId: string) =>
    [...gameKeys.all, gameId, "seasons"] as const,

  lastPlayers: (gameId: string) =>
    [...gameKeys.game(gameId), "last_players"] as const,

  scoreboard: <T extends string>(
    gameId: string,
    season?: string,
    sort?: Sort<T>,
  ) => {
    const key: unknown[] = [...gameKeys.game(gameId), "scoreboard"];

    if (season) {
      key.push(season);
    }

    if (sort) {
      key.push(sort);
    }

    return key;
  },
};
