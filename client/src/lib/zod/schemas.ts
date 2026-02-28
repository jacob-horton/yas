import type { DateValue } from "@ark-ui/solid";
import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Must be at least 8 characters")
  .max(1023, "Cannot exceed 1023 characters");

export const numericStringSchema = z
  .string()
  .min(1, "This field is required")
  .transform((val) => Number(val))
  .pipe(z.number("Please enter a valid number"));

export const nullableNumericStringSchema = z
  .string()
  .transform((val) => {
    if (val.trim() === "") return null;
    return Number(val);
  })
  .pipe(z.number("Please enter a valid number").nullable());

export const futureDateSchema = z
  .custom<DateValue>((val) => val !== undefined && val !== null && val !== "", {
    message: "Must be a valid date",
  })
  .refine(
    (val) => {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const inputDate = val.toDate(tz);
      const now = new Date();
      return inputDate > now;
    },
    { message: "Date must be in the future" },
  )
  .transform((val) => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return val.toDate(tz).toISOString();
  });

export const nullableFutureDateSchema = z
  .custom<DateValue | null | undefined>()
  .transform((val) => val ?? null)
  .pipe(futureDateSchema.nullable());
