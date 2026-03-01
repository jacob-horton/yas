import type { AvatarColour, AvatarIcon } from "@/components/ui/avatar";
import type { Icon } from "@/lib/icons";
import type { Colour } from "../constants";

export type MatchStats = {
  match_id: string;
  score: number;
  played_at: string;
  rank_in_match: number;
};

export type Player = {
  id: string;
  name: string;
  avatar: AvatarIcon;
  avatar_colour: AvatarColour;
};

export type PlayerStatsRouteParams = {
  gameId: string;
  playerId: string;
};

export type PlayerHighlightStats = {
  player: Player;
  lifetime: HighlightStatsLifetime;
};

export type PlayerHistory = {
  player: Player;
  matches: MatchStats[];
};

export type HighlightStatsLifetime = {
  average_score: number;
  best_score: number;
  total_games: number;
  win_rate: number;
  rank: number;
};

type GammaDistribution = {
  type: "gamma";
  lambda: number;
  alpha: number;
};

type PlayerStatsEntry = {
  distribution: GammaDistribution;
  min_score: number;
  max_score: number;
};

export type DistributionData = Record<string, PlayerStatsEntry>;

export type StatData = {
  icon: Icon;
  colour: Colour;
  label: string;
  getValue: (data: PlayerHighlightStats) => string;
};
