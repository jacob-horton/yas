import { z } from "zod";
import { numericStringSchema } from "@/lib/zod/schemas";

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

export const createGameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Must be at least 3 characters")
    .max(50, "Cannot exceed 50 characters"),

  players_per_match: numericStringSchema.pipe(
    z
      .number()
      .min(2, "Must have at least 2 players")
      .max(50, "Cannot exceed 50 players"),
  ),

  metric: z.string().pipe(z.enum(scoringMetrics)),
});
export type CreateGameRequest = z.output<typeof createGameSchema>;

export const updateGameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Must be at least 3 characters")
    .max(50, "Cannot exceed 50 characters"),

  players_per_match: numericStringSchema.pipe(
    z
      .number()
      .min(2, "Must have at least 2 players")
      .max(50, "Cannot exceed 50 players"),
  ),

  metric: z.string().pipe(z.enum(scoringMetrics)),
});
export type UpdateGameRequest = z.output<typeof updateGameSchema>;
