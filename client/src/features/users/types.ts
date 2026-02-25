import { z } from "zod";
import type { AvatarColour, AvatarIcon } from "@/components/ui/avatar";
import { passwordSchema } from "@/lib/zod/schemas";

export const createUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Must be at least 1 character")
      .max(512, "Cannot exceed 512 characters"),

    email: z.email(),

    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  // Remove confirm_password
  .transform(({ confirm_password, ...rest }) => rest);
export type CreateUserRequest = z.output<typeof createUserSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  // Remove confirm_password
  .transform(({ confirm_password, ...rest }) => rest);
export type ResetPasswordRequest = z.output<typeof resetPasswordSchema>;

export type User = {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: AvatarIcon;
  avatar_colour: AvatarColour;
  email_verified: boolean;
};

export const updateEmailSchema = z.object({ email: z.email() });
export type UpdateEmailRequest = z.output<typeof updateEmailSchema>;

export const updatePasswordSchema = z
  .object({
    current_password: z.string(),
    new_password: passwordSchema,
    confirm_new_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "Passwords do not match",
    path: ["confirm_new_password"],
  })
  // Remove confirm_new_password
  .transform(({ confirm_new_password, ...rest }) => rest);
export type UpdatePasswordRequest = z.output<typeof updatePasswordSchema>;
