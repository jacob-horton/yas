import type { AvatarColour, AvatarIcon } from "@/components/ui/avatar";
import type { Game } from "./game";

export type Scoreboard = {
  entries: ScoreboardEntry[];
  podium: ScoreboardEntry[];
  game: Game;
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
};
