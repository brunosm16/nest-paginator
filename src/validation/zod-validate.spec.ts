import { z } from 'zod';

import { zodValidate } from './zod-validate';

const testSchema = z.object({
  age: z.number().int().positive(),
  email: z.string().email(),
  name: z.string().min(2),
});

describe('Zod Validate', () => {
  it('Should return an error if validation fails', () => {
    try {
      zodValidate(testSchema, { age: 0, email: 'invalid-email', name: 'a' });
    } catch (err) {
      const totalErrors = err?.errors?.length;

      expect(err).toBeInstanceOf(Error);
      expect(err.errors).toBeInstanceOf(Array);
      expect(totalErrors).toEqual(3);
    }
  });

  it('Should not return an error if validation passes', () => {
    const result = zodValidate(testSchema, {
      age: 10,
      email: 'validemail@email.com',
      name: 'John Doe',
    });

    expect(result).toEqual({
      age: 10,
      email: 'validemail@email.com',
      name: 'John Doe',
    });
  });
});
