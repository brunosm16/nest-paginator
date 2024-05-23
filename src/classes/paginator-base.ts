import type { PaginatorProperties } from 'src/types';

export abstract class PaginatorBase<T> {
  protected paginatorProperties: PaginatorProperties<T>;

  constructor(paginatorProperties: PaginatorProperties<T>) {
    this.paginatorProperties = paginatorProperties;
  }
}
