import { z } from "zod";
import { numericStringSchema } from "@/lib/zod/schemas";

export const matchScoreSchema = z.object({
  user_id: z.string().nonempty("Must be non-empty"),
  score: numericStringSchema,
});
export type MatchScore = z.output<typeof matchScoreSchema>;

export const createMatchSchema = (
  minPlayersPerMatch: number,
  maxPlayersPerMatch: number,
) =>
  z.object({
    scores: z
      .array(matchScoreSchema)
      .min(minPlayersPerMatch)
      .max(maxPlayersPerMatch),
  });
export type CreateMatchRequest = z.output<ReturnType<typeof createMatchSchema>>;

export type Match = {
  id: string;
  game_id: string;
  played_at: string;
  scores: MatchScore;
};
