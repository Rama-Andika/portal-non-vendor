import { useState } from "react";
import { type ZodSchema, ZodError, type ZodIssue, type ZodTypeAny } from "zod";

type UseZodFormReturn<T> = {
  errors: Partial<Record<string, string>>;
  validate: (data: T, omitPaths?: string[]) => boolean;
  resetErrors: () => void;
};

/**
 * Convert path strings like ['a.b.c', 'x.y'] to nested object:
 * { a: { b: { c: true } }, x: { y: true } }
 */
const buildOmitShape = (paths: string[]): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const path of paths) {
    const keys = path.split(".");
    let current = result;
    keys.forEach((key, idx) => {
      if (idx === keys.length - 1) {
        current[key] = true;
      } else {
        current[key] = (current[key] as Record<string, unknown>) || {};
        current = current[key] as Record<string, unknown>;
      }
    });
  }
  return result;
};

export const useZodForm = <T extends Record<string, unknown>>(
  schema: ZodSchema<T>,
): UseZodFormReturn<T> => {
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validate = (data: T, omitPaths: string[] = []): boolean => {
    try {
      let currentSchema: ZodTypeAny = schema;

      if (omitPaths.length > 0 && "omit" in currentSchema) {
        const omitShape = buildOmitShape(omitPaths);
        currentSchema = (
          currentSchema as unknown as { omit: (shape: unknown) => ZodTypeAny }
        ).omit(omitShape);
      }

      currentSchema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<Record<string, string>> = {};
        error.issues.forEach((issue: ZodIssue) => {
          const fieldPath = issue.path.join(".");
          if (!fieldErrors[fieldPath]) {
            fieldErrors[fieldPath] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const resetErrors = () => setErrors({});

  return { errors, validate, resetErrors };
};
