import { z } from "zod";
import {
  nullableFutureDateSchema,
  nullableNumericStringSchema,
} from "@/lib/zod/schemas";

export type InviteDetail = {
  id: string;
  created_by_name: string;
  expires_at: string;

  group_id: string;
  group_name: string;

  is_current_user_member: boolean;
};

export type InviteSummary = {
  id: string;
  name: string;
  created_by_name: string;
  max_uses: number | null;
  uses: number;
  created_at: string;
  expires_at: string;
};

export const createInviteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Must be at least 3 characters")
    .max(50, "Cannot exceed 50 characters"),

  expires_at: nullableFutureDateSchema,

  max_uses: nullableNumericStringSchema.pipe(
    z.number().min(1, "Must be able to use at least once").nullable(),
  ),
});
export type CreateInviteRequest = z.output<typeof createInviteSchema>;
