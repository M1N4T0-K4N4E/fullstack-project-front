import type { z } from 'zod/v4';

class ValidationError extends Error {
  inner: { message: string; path: string }[] = [];
  constructor(message?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function toFormikValidationSchema<T extends z.ZodType>(schema: T) {
  return {
    async validate(values: unknown) {
      const result = await schema.safeParseAsync(values);
      if (result.success) return;
      const error = new ValidationError('Validation failed');
      error.inner = result.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.map(String).join('.'),
      }));
      throw error;
    },
  };
}
