import { z } from 'zod';

export const PaginatorOptionsSchema = z.object({
  limit: z.number().positive(),
  page: z.number().positive(),
  query: z.any().optional(),
});
