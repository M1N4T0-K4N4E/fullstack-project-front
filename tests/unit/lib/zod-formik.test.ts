import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';
import { toFormikValidationSchema } from '@/lib/zod-formik';

describe('toFormikValidationSchema', () => {
  it('passes validation when schema is valid', async () => {
    const schema = z.object({
      email: z.string().email(),
      profile: z.object({
        age: z.number().min(18),
      }),
    });

    const validator = toFormikValidationSchema(schema);
    await expect(
      validator.validate({
        email: 'test@example.com',
        profile: { age: 21 },
      }),
    ).resolves.toBeUndefined();
  });

  it('throws Formik-style ValidationError with mapped inner issues', async () => {
    const schema = z.object({
      email: z.string().email('invalid email'),
      profile: z.object({
        age: z.number().min(18, 'too young'),
      }),
    });

    const validator = toFormikValidationSchema(schema);

    await expect(
      validator.validate({
        email: 'bad-email',
        profile: { age: 12 },
      }),
    ).rejects.toMatchObject({
      name: 'ValidationError',
      message: 'Validation failed',
      inner: [
        { message: 'invalid email', path: 'email' },
        { message: 'too young', path: 'profile.age' },
      ],
    });
  });
});
