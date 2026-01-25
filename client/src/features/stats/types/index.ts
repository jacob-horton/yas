export type MatchStats = {
  match_id: string;
  score: number;
  played_at: string;
  rank_in_match: number;
};

export type PlayerStatsRouteParams = {
  gameId: string;
  playerId: string;
};
