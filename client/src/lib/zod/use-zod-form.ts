import { createStore, reconcile, type SetStoreFunction } from "solid-js/store";
import type { z } from "zod";

// Helper function to get string path from nested object (used for error paths)
type Path<T> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ?
            | `${K}`
            | (NonNullable<T[K]> extends object
                ? `${K}.${Path<NonNullable<T[K]>>}`
                : never)
        : never;
    }[keyof T]
  : never;

export function useZodForm<T extends z.ZodType>(
  schema: T,
  initialValues: z.input<T> & object,
) {
  type FormInput = z.input<T> & object;
  type FormOutput = z.output<T>;
  type FormPath = Path<FormInput>;

  const [values, setValues] = createStore<FormInput>(initialValues);
  const [errors, setErrors] = createStore<Partial<Record<FormPath, string>>>(
    {},
  );

  const setError = (path: FormPath, message: string | undefined) => {
    setErrors({ [path]: message } as any);
  };

  const setField: SetStoreFunction<FormInput> = (...args: any[]) => {
    (setValues as any)(...args);

    // NOTE: not handling clearing errors if using one of:
    // - setField((prev) => ...)
    // - setField({ ... })
    if (
      args.length >= 2 &&
      typeof args[0] !== "object" &&
      typeof args[0] !== "function"
    ) {
      const path = args.slice(0, -1).join(".") as FormPath;
      setErrors({ [path]: undefined } as any);
    }
  };

  const validate = (): FormOutput | null => {
    const result = schema.safeParse(values);

    if (!result.success) {
      const newErrors: Partial<Record<FormPath, string>> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".") as FormPath;
        newErrors[path] = issue.message;
      });

      setErrors(reconcile(newErrors));
      return null;
    }

    setErrors(reconcile({}));
    return result.data;
  };

  const clearErrors = () => setErrors(reconcile({}));

  return { values, errors, setField, setError, validate, clearErrors };
}
