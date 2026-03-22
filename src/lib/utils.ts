import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toFormikValidationSchema(zodSchema: z.ZodSchema) {
  return async (values: Record<string, unknown>) => {
    const result = await zodSchema.safeParseAsync(values)
    if (!result.success) {
      const errors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path.join(".")
        if (!errors[path]) {
          errors[path] = issue.message
        }
      }
      return errors
    }
    return {}
  }
}
