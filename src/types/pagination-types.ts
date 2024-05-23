export type PaginationPreviousAndNext = {
  next: string;
  previous: string;
};

export type PaginationPayload = {
  limit: number;
  page: number;
  route?: string;
};

export type PaginationRepositoryData<T> = {
  data: T[];
  dataCount: number;
  pageDataCount: number;
  totalData: number;
};
