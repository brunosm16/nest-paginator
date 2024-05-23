import type { Repository } from 'typeorm';

import { Paginator } from 'src/classes/paginator';

import type {
  PaginationPayload,
  PaginationPreviousAndNext,
  PaginationRepositoryData,
  PaginatorProperties,
} from '../types';

const concatPageOnRoute = (route: string, page: number): string =>
  `${route}?page=${page}`;

const makePaginationPreviousAndNext = (
  previous: number,
  next: number,
  route: string
) => {
  const parsedNext = next ? concatPageOnRoute(route, next) : '';
  const parsedPrevious = previous ? concatPageOnRoute(route, previous) : '';

  const result: PaginationPreviousAndNext = {
    next: parsedNext,
    previous: parsedPrevious,
  };

  return result;
};

const setPaginationPreviousAndNext = (
  paginationPayload: PaginationPayload,
  total: number
): PaginationPreviousAndNext => {
  let previous = null;
  let next = null;

  const { limit, page, route } = paginationPayload;

  if (page > 1) {
    previous = page - 1;
  }

  const maxPage = Math.ceil(total / limit);
  const isPageInMaxLimit = page <= maxPage;

  if (isPageInMaxLimit) {
    next = page + 1;
  }

  const routeWithPreviousAndNext = makePaginationPreviousAndNext(
    previous,
    next,
    route
  );

  return routeWithPreviousAndNext;
};

const extractRepositoryData = async <T>(
  repository: Repository<T>,
  paginationPayload: PaginationPayload
): Promise<PaginationRepositoryData<T>> => {
  const [items, total] = await repository.findAndCount({
    skip: paginationPayload.page,
    take: paginationPayload.limit,
  });

  const pageDataCount = total / paginationPayload.limit;

  return {
    data: items,
    dataCount: items.length,
    pageDataCount,
    totalData: total,
  };
};

async function paginator<T>(
  repository: Repository<T>,
  paginationPayload: PaginationPayload
): Promise<Paginator<T>> {
  try {
    const repositoryData = await extractRepositoryData(
      repository,
      paginationPayload
    );

    const { next, previous } = setPaginationPreviousAndNext(
      paginationPayload,
      repositoryData.totalData
    );

    const properties: PaginatorProperties<T> = {
      ...repositoryData,
      next,
      previous,
    };

    return new Paginator(properties);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export default paginator;
