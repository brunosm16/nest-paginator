export type PaginatorResult<T> = {
  data: T[];
  dataCount: number;
  nextPage: string;
  pageDataCount: number;
  previousPage: string;
  totalData: number;
};

export type PaginatorRoutes = {
  nextPage: string;
  previousPage: string;
};

export type PaginatorProperties = {
  limit: number;
  page: number;
  route?: string;
};

export type PaginatorRepositoryData<T> = {
  data: T[];
  dataCount: number;
  pageDataCount: number;
  totalData: number;
};
