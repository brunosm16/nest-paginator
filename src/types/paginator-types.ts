export type PaginatorProperties<T> = {
  data: T[];
  dataCount: number;
  next: string;
  pageDataCount: number;
  previous: string;
  totalData: number;
};
