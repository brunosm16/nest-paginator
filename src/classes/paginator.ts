/* eslint-disable @typescript-eslint/no-useless-constructor */

import type { Repository } from 'typeorm';

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
      ...routes,
    };
  }

  private async fetchRepositoryData(
    repository: Repository<T>,
    properties: PaginatorProperties
  ): Promise<PaginatorRepositoryData<T>> {
    const [items, total] = await repository.findAndCount({
      skip: properties.page,
      take: properties.limit,
    });

    const pageDataCount = Math.ceil(total / properties.limit);

    return {
      data: items,
      dataCount: items.length,
      pageDataCount,
      totalData: total,
    };
  }

  private getNextPage(
    paginatorProperties: PaginatorProperties,
    lastPage: number
  ): string {
    const { page, route } = paginatorProperties;

    let resultPage = page;

    if (page <= lastPage) {
      resultPage += 1;
    }

    return this.concatenateRoute(route, resultPage);
  }

  private getPreviousPage(paginatorProperties: PaginatorProperties): string {
    const { page, route } = paginatorProperties;

    let previous = page - 1;

    if (previous < 1) {
      previous = 1;
    }

    return this.concatenateRoute(route, previous);
  }

  private getRoutes(
    paginatorProperties: PaginatorProperties,
    lastPage: number
  ): PaginatorRoutes {
    return {
      nextPage: this.getNextPage(paginatorProperties, lastPage),
      previousPage: this.getPreviousPage(paginatorProperties),
    };
  }

  public async paginate(
    repository: Repository<T>,
    properties: PaginatorProperties
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
