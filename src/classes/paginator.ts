/* eslint-disable @typescript-eslint/no-useless-constructor */

import type { FindManyOptions, Repository } from 'typeorm';

import type {
  PaginatorProperties,
  PaginatorRepositoryData,
  PaginatorResult,
  PaginatorRoutes,
} from '../types';

import { PaginatorBase } from './paginator-base';

export class Paginator<T> extends PaginatorBase<T> {
  constructor() {
    super();
  }

  private concatenateRoute(route: string, page: number): string {
    return `${route}?page=${page}`;
  }

  private createPaginatorResult(
    repositoryData: PaginatorRepositoryData<T>,
    routes: PaginatorRoutes
  ): PaginatorResult<T> {
    return {
      ...repositoryData,
      routes,
    };
  }

  private async fetchRepositoryData(
    repository: Repository<T>,
    properties: PaginatorProperties<T>
  ): Promise<PaginatorRepositoryData<T>> {
    const findOptions = this.resolveFindOptions(properties);
    const [items, total] = await repository.findAndCount(findOptions);

    const pageDataCount = Math.ceil(total / properties.limit);

    return {
      data: items,
      dataCount: items.length,
      pageDataCount,
      totalData: total,
    };
  }

  private getNextPage(
    page: number,
    route: string,
    lastPage: number
  ): null | string {
    let next = page;

    if (page >= lastPage) {
      return null;
    }

    if (page < lastPage) {
      next += 1;
    }

    return this.concatenateRoute(route, next);
  }

  private getPreviousPage(page: number, route: string): string {
    let previous = page;

    if (previous <= 1) {
      return null;
    }

    if (previous > 1) {
      previous -= 1;
    }

    return this.concatenateRoute(route, previous);
  }

  private getRoutes(
    paginatorProperties: PaginatorProperties<T>,
    lastPage: number
  ): PaginatorRoutes {
    const { page, route } = paginatorProperties;

    if (!route) {
      return {
        nextPage: null,
        previousPage: null,
      };
    }

    const resolvedRoutePage = this.resolveRoutePage(page);

    return {
      nextPage: this.getNextPage(resolvedRoutePage, route, lastPage),
      previousPage: this.getPreviousPage(resolvedRoutePage, route),
    };
  }

  private resolveFindOptions(
    properties: PaginatorProperties<T>
  ): FindManyOptions<T> {
    const { limit, page, queryOptions = {} } = properties;
    const resolvedPage = this.resolvePage(page);

    const skip = resolvedPage * limit;

    return {
      skip,
      take: limit,
      ...queryOptions,
    };
  }

  private resolvePage(page: number): number {
    if (page <= 0) {
      return 0;
    }

    return page - 1;
  }

  private resolveRoutePage(page: number): number {
    if (page <= 0) {
      return 1;
    }

    return page;
  }

  public async paginate(
    repository: Repository<T>,
    properties: PaginatorProperties<T>
  ): Promise<PaginatorResult<T>> {
    try {
      const repositoryData = await this.fetchRepositoryData(
        repository,
        properties
      );

      const paginatorRoutes = this.getRoutes(
        properties,
        repositoryData.pageDataCount
      );

      return this.createPaginatorResult(repositoryData, paginatorRoutes);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
