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
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Must be a valid date and time",
  })
  .refine(
    (val) => {
      const inputDate = new Date(val);
      const now = new Date();
      return inputDate > now;
    },
    { message: "Date and time must be in the future" },
  )
  .transform((val) => new Date(val).toISOString());

export const nullableFutureDateSchema = z
  .string()
  .transform((val) => {
    if (val.trim() === "") return null;
    return val;
  })
  .pipe(futureDateSchema.nullable());
