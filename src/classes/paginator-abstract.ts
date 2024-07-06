import type { Repository } from 'typeorm';

import type { PaginatorOptions, PaginatorResult } from '../types';

export abstract class PaginatorAbstract<T> {
  public abstract paginate(
    repository: Repository<T>,
    options: PaginatorOptions<T>
  ): Promise<PaginatorResult<T>>;
}
