/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-useless-constructor */

import type { SelectQueryBuilder } from 'typeorm';

import { PaginatorOptionsSchema } from '@/schemas/options-schema';
import { zodValidate } from '@/validation/zod-validate';
import { Repository } from 'typeorm';

import type {
  PaginatorAllowedInstances,
  PaginatorOptions,
  PaginatorResponse,
  PaginatorResponseInformation,
} from '../types';

import { PaginatorAbstract } from './paginator-abstract';

export class Paginator<T> extends PaginatorAbstract<T> {
  constructor() {
    super();
  }

  private async countQueryBuilderRaw(
    queryBuilder: SelectQueryBuilder<T>
  ): Promise<number> {
    const [query, queryParameters] = queryBuilder.getQueryAndParameters();

    const innerQuery = `(${query})`;

    const { total } = await queryBuilder
      .createQueryBuilder()
      .select('COUNT(*)', 'total')
      .from(innerQuery, 'table_to_count')
      .setParameters(queryParameters)
      .getRawOne<{ total: number }>();

    return Number(total);
  }

  private async fetchDataPaginated(
    typeOrmInstance: PaginatorAllowedInstances<T>,
    options: PaginatorOptions<T>
  ) {
    const normalizedOptions = this.normalizeOptions(options);

    if (typeOrmInstance instanceof Repository) {
      return this.fetchRepository(typeOrmInstance, normalizedOptions);
    }

    return this.fetchQueryBuilder(typeOrmInstance, normalizedOptions);
  }

  private async fetchQueryBuilder(
    queryBuilder: SelectQueryBuilder<T>,
    options: PaginatorOptions<T>
  ) {
    const { isRawPagination, limit, page } = options;

    if (isRawPagination) {
      return this.paginateQueryBuilderRaw(queryBuilder, limit, page);
    }

    return queryBuilder
      .limit(limit)
      .offset(page * limit)
      .getManyAndCount();
  }

  private async fetchRepository(
    repository: Repository<T>,
    options: PaginatorOptions<T>
  ) {
    const { limit, page, query } = options;

    return repository.findAndCount({
      skip: page * limit,
      take: limit,
      ...query,
    });
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

  private makeEmptyResponseInformation(
    limit: number
  ): PaginatorResponseInformation {
    return {
      limitRows: limit,
      pages: {
        currentPage: null,
        lastPage: null,
        nextPage: null,
        previousPage: null,
      },
      totalRows: 0,
    };
  }

  private normalizeOptions(options: PaginatorOptions<T>): PaginatorOptions<T> {
    const normalizedPage = options.page - 1;

    return {
      ...options,
      page: normalizedPage,
    };
  }

  private async paginateQueryBuilderRaw(
    queryBuilder: SelectQueryBuilder<T>,
    limit: number,
    page: number
  ) {
    const count = await this.countQueryBuilderRaw(queryBuilder);

    const data = await queryBuilder
      .limit(limit)
      .offset(page * limit)
      .getRawMany<T>();

    return [data, count] as [T[], number];
  }

  private resolvePages(page: number, lastPage: number) {
    const nextPage = this.getNextPage(page, lastPage);
    const previousPage = this.getPreviousPage(page, lastPage);

    return {
      nextPage,
      previousPage,
    };
  }

  private resolveResponseInformation(
    total: number,
    options: PaginatorOptions<T>
  ) {
    const { limit, page } = options;

    if (total === 0) {
      return this.makeEmptyResponseInformation(limit);
    }

    const lastPage = Math.ceil(total / limit);

    const { nextPage, previousPage } = this.resolvePages(page, lastPage);

    return {
      limitRows: limit,
      pages: {
        currentPage: page,
        lastPage,
        nextPage,
        previousPage,
      },
      totalRows: total,
    };
  }

  public async paginate(
    typeOrmInstance: PaginatorAllowedInstances<T>,
    options: PaginatorOptions<T>
  ): Promise<PaginatorResponse<T>> {
    try {
      zodValidate(PaginatorOptionsSchema, options);

      const [data, total] = await this.fetchDataPaginated(
        typeOrmInstance,
        options
      );

      const responseInformation = this.resolveResponseInformation(
        total,
        options
      );

      return {
        responseData: data,
        responseInformation,
      };
    } catch (err) {
      throw err;
    }
  }
}
