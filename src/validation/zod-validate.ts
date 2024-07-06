import type { AnyZodObject } from 'zod';

export const zodValidate = (schema: AnyZodObject, args: any) => {
  // eslint-disable-next-line no-useless-catch
  try {
    schema.parse(args);
  } catch (error) {
    throw error;
  }
};
