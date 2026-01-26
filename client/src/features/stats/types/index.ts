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

export type PlayerStatsSummary = {
  period: StatsPeriod;
  lifetime: StatsLifetime;
};

export type StatsPeriod = {
  average_score: number;
  win_rate: number;
  best_score: number;
  rank: number;
};

export type StatsLifetime = {
  average_score: number;
  best_score: number;
  total_games: number;
  win_rate: number;
};
