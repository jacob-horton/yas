export type CreateMatchRequest = {
  scores: MatchScore[];
};

export type MatchScore = {
  user_id: string;
  score: number;
};

export type Match = {
  id: string;
  game_id: string;
  played_at: string;
  scores: MatchScore;
};
