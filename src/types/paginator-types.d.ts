import type { FindManyOptions } from 'typeorm';

export type PaginatorOptions<T> = {
  limit: number;
  page: number;
  query?: FindManyOptions<T>;
};

export type PaginatorResponse<T> = {
  responseData: T[];
  responseInformation: PaginatorResponseInformation;
};

export type PaginatorResponseInformation = {
  limitRows: number;
  pages: PaginatorPages;
  totalRows: number;
};

export type PaginatorPages = {
  currentPage: null | number;
  lastPage: null | number;
  nextPage: null | number;
  previousPage: null | number;
};
