import type { Repository } from 'typeorm';

import type { PaginatorQuery, PaginatorResult } from '../types';

export abstract class PaginatorBase<T> {
  public abstract paginate(
    repository: Repository<T>,
    properties: PaginatorQuery<T>
  ): Promise<PaginatorResult<T>>;
}
