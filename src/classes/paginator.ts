/* eslint-disable @typescript-eslint/no-useless-constructor */
import type { PaginatorProperties } from 'src/types';

import { PaginatorBase } from './paginator-base';

export class Paginator<T> extends PaginatorBase<T> {
  constructor(properties: PaginatorProperties<T>) {
    super(properties);
  }
}
