import type { Repository } from 'typeorm';

import type { PaginatorProperties, PaginatorResult } from '../types';

export abstract class PaginatorBase<T> {
  public abstract paginate(
    repository: Repository<T>,
    properties: PaginatorProperties
  ): Promise<PaginatorResult<T>>;
}
