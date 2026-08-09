export const statsKeys = {
  all: ["stats"] as const,

  game: (gameId: string, seasonId?: string) => {
    const key = [...statsKeys.all, "game", gameId];
    if (seasonId) {
      key.push(seasonId);
    }

    return key;
  },

  player: (gameId: string, playerId: string, seasonId?: string) =>
    [...statsKeys.game(gameId, seasonId), "player", playerId] as const,

  distributions: (gameId: string, seasonId?: string) =>
    [...statsKeys.game(gameId, seasonId), "distributions"] as const,

  playerHistory: (gameId: string, playerId: string, seasonId?: string) =>
    [...statsKeys.player(gameId, playerId, seasonId), "history"] as const,

  playerHighlights: (gameId: string, playerId: string, seasonId?: string) =>
    [...statsKeys.player(gameId, playerId, seasonId), "highlights"] as const,
};
