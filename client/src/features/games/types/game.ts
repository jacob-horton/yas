import { z } from "zod";
import {
  nullableNumericStringSchema,
  numericStringSchema,
} from "@/lib/zod/schemas";

export const scoringMetrics = ["win_rate", "average_score"] as const;
export type ScoringMetric = (typeof scoringMetrics)[number];

export const durationUnits = ["days", "months"] as const;
export type DurationUnit = (typeof durationUnits)[number];

export type GameRouteParams = {
  gameId: string;
};

export type Game = {
  id: string;
  name: string;
  created_at: string;
  min_players_per_match: number;
  max_players_per_match: number;
  metric: ScoringMetric;

  season_duration: {
    value: number;
    unit: DurationUnit;
  } | null;

  star_threshold: number | null;
  gold_threshold: number | null;
  silver_threshold: number | null;
  bronze_threshold: number | null;
};

const medalScoresSchema = z
  .object({
    star: nullableNumericStringSchema,
    gold: nullableNumericStringSchema,
    silver: nullableNumericStringSchema,
    bronze: nullableNumericStringSchema,
  })
  .optional();

export const createGameSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Must be at least 3 characters")
      .max(50, "Cannot exceed 50 characters"),

    min_players_per_match: numericStringSchema.pipe(
      z
        .number()
        .min(1, "Must have at least 1 player")
        .max(50, "Cannot exceed 50 players"),
    ),

    max_players_per_match: numericStringSchema.pipe(
      z
        .number()
        .min(1, "Must have at least 1 player")
        .max(50, "Cannot exceed 50 players"),
    ),

    metric: z.string().pipe(z.enum(scoringMetrics)),

    season_duration: z
      .object({
        value: nullableNumericStringSchema.pipe(
          z.number().min(1, "Must be at least 1").nullable(),
        ),
        unit: z.enum(durationUnits),
      })
      .optional(),

    medal_scores: medalScoresSchema,
  })
  .refine((data) => data.min_players_per_match <= data.max_players_per_match, {
    message: "Max players cannot be less than min players",
    path: ["max_players_per_match"],
  });
export type CreateGameRequest = z.output<typeof createGameSchema>;

export const updateGameSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Must be at least 3 characters")
      .max(50, "Cannot exceed 50 characters"),

    min_players_per_match: numericStringSchema.pipe(
      z
        .number()
        .min(1, "Must have at least 1 player")
        .max(50, "Cannot exceed 50 players"),
    ),

    max_players_per_match: numericStringSchema.pipe(
      z
        .number()
        .min(1, "Must have at least 1 player")
        .max(50, "Cannot exceed 50 players"),
    ),

    metric: z.string().pipe(z.enum(scoringMetrics)),

    season_duration: z
      .object({
        value: nullableNumericStringSchema.pipe(
          z.number().min(1, "Must be at least 1").nullable(),
        ),
        unit: z.enum(durationUnits),
      })
      .optional(),

    medal_scores: z
      .object({
        star: nullableNumericStringSchema,
        gold: nullableNumericStringSchema,
        silver: nullableNumericStringSchema,
        bronze: nullableNumericStringSchema,
      })
      .optional(),
  })
  .refine((data) => data.min_players_per_match <= data.max_players_per_match, {
    message: "Max players cannot be less than min players",
    path: ["max_players_per_match"],
  });
export type UpdateGameRequest = z.output<typeof updateGameSchema> & {
  next_season_start?: string | undefined;
};
