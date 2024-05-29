import type { FindManyOptions } from 'typeorm';

export type PaginatorResult<T> = {
  data: T[];
  dataCount: number;
  pageDataCount: number;
  routes: PaginatorRoutes;
  totalData: number;
};

export type PaginatorRoutes = {
  nextPage: null | string;
  previousPage: null | string;
};

export type PaginatorProperties<T> = {
  limit: number;
  page: number;
  queryOptions?: FindManyOptions<T>;
  route?: string;
};

export type PaginatorRepositoryData<T> = {
  data: T[];
  dataCount: number;
  pageDataCount: number;
  totalData: number;
};
