/* eslint-disable @typescript-eslint/no-useless-constructor */

import type { FindManyOptions, Repository } from 'typeorm';

import type {
  PaginatorPages,
  PaginatorQuery,
  PaginatorRepositoryData,
  PaginatorResult,
} from '../types';

import { PaginatorBase } from './paginator-base';

export class Paginator<T> extends PaginatorBase<T> {
  constructor() {
    super();
  }

  private getNextPage(page: number, lastPage: number): null | number {
    let next = page;

    if (page >= lastPage) {
      return null;
    }

    if (page < lastPage) {
      next += 1;
    }

    return next;
  }

  private getPreviousPage(page: number, lastPage: number): null | number {
    let previous = page;

    if (previous > lastPage) {
      return null;
    }

    if (previous <= 1) {
      return null;
    }

    if (previous > 1) {
      previous -= 1;
    }

    return previous;
  }

  private async getRepositoryData(
    repository: Repository<T>,
    query: PaginatorQuery<T>
  ): Promise<PaginatorRepositoryData<T>> {
    const findOptions = this.resolveFindOptions(query);
    const [items, total] = await repository.findAndCount(findOptions);

    const { limit } = query;

    const totalPages = Math.ceil(total / limit);

    return {
      result: items,
      resultLength: items.length,
      totalDataLength: total,
      totalPages,
    };
  }

  private resolveFindOptions(
    properties: PaginatorQuery<T>
  ): FindManyOptions<T> {
    const { limit, page, query = {} } = properties;
    const resolvedPage = this.resolvePageToRepository(page);

    const skip = resolvedPage * limit;

    return {
      skip,
      take: limit,
      ...query,
    };
  }

  private resolvePageToRepository(page: number): number {
    if (page <= 0) {
      return 0;
    }

    return page - 1;
  }

  private resolvePageToResult(page: number): number {
    if (page <= 0) {
      return 1;
    }

    return page;
  }

  private resolvePages(
    query: PaginatorQuery<T>,
    lastPage: number
  ): PaginatorPages {
    const { page } = query;

    const resolvedPage = this.resolvePageToResult(page);

    return {
      next: this.getNextPage(resolvedPage, lastPage),
      previous: this.getPreviousPage(resolvedPage, lastPage),
    };
  }

  public async paginate(
    repository: Repository<T>,
    query: PaginatorQuery<T>
  ): Promise<PaginatorResult<T>> {
    try {
      const repositoryData = await this.getRepositoryData(repository, query);

      const { totalPages } = repositoryData;
      const pages = this.resolvePages(query, totalPages);

      return {
        ...repositoryData,
        ...pages,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
