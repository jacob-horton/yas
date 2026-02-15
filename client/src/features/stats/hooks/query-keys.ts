export const statsKeys = {
  all: ["stats"] as const,

  game: (gameId: string) => [...statsKeys.all, "game", gameId] as const,

  distributions: (gameId: string) =>
    [...statsKeys.game(gameId), "distributions"] as const,

  player: (gameId: string, playerId: string) =>
    [...statsKeys.game(gameId), "player", playerId] as const,

  playerHistory: (gameId: string, playerId: string) =>
    [...statsKeys.player(gameId, playerId), "history"] as const,

  playerHighlights: (gameId: string, playerId: string) =>
    [...statsKeys.player(gameId, playerId), "highlights"] as const,
};
