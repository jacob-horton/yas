import type { Game } from "./game";

export type Scoreboard = {
  entries: ScoreboardEntry[];
  game: Game;
};

export type ScoreboardEntry = {
  user_name: string;
  win_rate: number;
  average_score: number;
};
