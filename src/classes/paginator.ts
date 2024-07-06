/* eslint-disable @typescript-eslint/no-useless-constructor */

import type { FindManyOptions, Repository } from 'typeorm';

import type {
  PaginatorOptions,
  PaginatorPages,
  PaginatorRepositoryData,
  PaginatorResult,
} from '../types';

import { PaginatorAbstract } from './paginator-abstract';

export class Paginator<T> extends PaginatorAbstract<T> {
  constructor() {
    super();
  }

  private getNextPage(page: number, limitPage: number): null | number {
    if (page >= limitPage) {
      return null;
    }

    return page + 1;
  }

  private getPreviousPage(page: number, lastPage: number): null | number {
    if (page > lastPage || page <= 1) {
      return null;
    }

    return page - 1;
  }

  private async getRepositoryData(
    repository: Repository<T>,
    options: PaginatorOptions<T>
  ): Promise<PaginatorRepositoryData<T>> {
    const findOptions = this.resolveFindOptions(options);
    const [items, total] = await repository.findAndCount(findOptions);

    const { limit } = options;

    const totalPages = Math.ceil(total / limit);

    return {
      result: items,
      resultLength: items.length,
      totalDataLength: total,
      totalPages,
    };
  }

  private resolveFindOptions(options: PaginatorOptions<T>): FindManyOptions<T> {
    const { limit, page, query = {} } = options;
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
    query: PaginatorOptions<T>,
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
    options: PaginatorOptions<T>
  ): Promise<PaginatorResult<T>> {
    try {
      const repositoryData = await this.getRepositoryData(repository, options);

      const { totalPages } = repositoryData;
      const pages = this.resolvePages(options, totalPages);

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
