export type GameRouteParams = {
  gameId: string;
};

export type Game = {
  id: string;
  name: string;
  created_at: string;
  players_per_match: number;
};

export type CreateGameRequest = {
  name: string;
  players_per_match: number;
};
