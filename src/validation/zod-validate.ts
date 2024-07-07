import type { AnyZodObject, ZodError } from 'zod';

class ZodValidationError extends Error {
  private readonly errors: string[];

  constructor(errors: string[]) {
    super();
    this.errors = errors;
  }
}

const formatZodError = (error: ZodError): ZodValidationError => {
  const formattedErrors = error?.issues.map(
    (issue) => issue.message ?? 'No message error provided'
  );

  const schemaError = new ZodValidationError(formattedErrors);

  return schemaError;
};

export const zodValidate = (schema: AnyZodObject, args: any) => {
  try {
    return schema.parse(args);
  } catch (error) {
    throw formatZodError(error);
  }
};
