import type { Game } from "./game";

export type Scoreboard = {
  entries: ScoreboardEntry[];
  game: Game;
};

export type ScoreboardEntry = {
  user_id: string;
  user_name: string;
  win_rate: number;
  average_score: number;
  matches_played: number;
  wins: number;
};
