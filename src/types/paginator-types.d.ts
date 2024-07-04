import type { FindManyOptions } from 'typeorm';

export type PaginatorResult<T> = {
  next: number;
  previous: number;
  result: T[];
  resultLength: number;
  totalDataLength: number;
  totalPages: number;
};

export type PaginatorRepositoryData<T> = {
  result: T[];
  resultLength: number;
  totalDataLength: number;
  totalPages: number;
};

export type PaginatorQuery<T> = {
  limit: number;
  page: number;
  query?: FindManyOptions<T>;
};

export type PaginatorPages = {
  next: null | number;
  previous: null | number;
};
