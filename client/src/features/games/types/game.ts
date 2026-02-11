export const scoringMetrics = ["win_rate", "average_score"] as const;
export type ScoringMetric = (typeof scoringMetrics)[number];

export type GameRouteParams = {
  gameId: string;
};

export type Game = {
  id: string;
  name: string;
  created_at: string;
  players_per_match: number;
  metric: ScoringMetric;
};

export type CreateGameRequest = {
  name: string;
  players_per_match: number;
  metric: ScoringMetric;
};
