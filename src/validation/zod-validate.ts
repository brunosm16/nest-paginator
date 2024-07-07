import type { AnyZodObject, ZodError } from 'zod';

class ZodValidationError extends Error {
  private readonly errors: string[];

  constructor(errors: string[]) {
    super();
    this.errors = errors;
  }
}

const formatZodError = (error: ZodError): ZodValidationError => {
  const formattedErrors = error?.issues.map((issue) => {
    const path = issue.path.join('.');
    const issueMessage = issue.message ?? 'No message error provided';
    const message = `Error at '${path}': ${issueMessage}`;
    return message;
  });

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
