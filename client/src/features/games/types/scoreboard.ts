import type { AvatarColour, AvatarIcon } from "@/components/ui/avatar";
import type { Game } from "./game";

export type Scoreboard = {
  entries: ScoreboardEntry[];
  podium: ScoreboardEntry[];
  highlights: Highlights;
  game: Game;
};

export type HighlightType =
  | "highest_win_rate"
  | "highest_average_score"
  | "highest_single_score"
  | "most_games_played";

export type HighlightDetail = {
  user_id: string;
  user_name: string;
  value: number;
};

export type Highlights = {
  highest_win_rate: HighlightDetail;
  highest_average_score: HighlightDetail;
  highest_single_score: HighlightDetail;
  most_games_played: HighlightDetail;
};

export type ScoreboardEntry = {
  user_id: string;
  user_name: string;
  user_avatar: AvatarIcon;
  user_avatar_colour: AvatarColour;
  win_rate: number;
  average_score: number;
  matches_played: number;
  wins: number;

  rank_diff: number;
  average_score_diff: number;
  win_rate_diff: number;
};
