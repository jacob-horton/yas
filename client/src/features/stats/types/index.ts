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

export type PlayerHighlightStats = {
  lifetime: HighlightStatsLifetime;
};

export type HighlightStatsLifetime = {
  average_score: number;
  best_score: number;
  total_games: number;
  win_rate: number;
  rank: number;
};
