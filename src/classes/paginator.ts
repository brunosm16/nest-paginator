/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-useless-constructor */

import type { FindManyOptions, SelectQueryBuilder } from 'typeorm';

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

  private async fetchDataPaginated(
    typeOrmInstance: PaginatorAllowedInstances<T>,
    options: PaginatorOptions<T>
  ) {
    if (typeOrmInstance instanceof Repository) {
      return this.fetchRepository(typeOrmInstance, options);
    }

    return this.fetchQueryBuilder(typeOrmInstance, options);
  }

  private async fetchQueryBuilder(
    queryBuilder: SelectQueryBuilder<T>,
    options: PaginatorOptions<T>
  ) {
    const { limit, page } = options;

    return queryBuilder
      .limit(limit)
      .offset(page * limit)
      .getManyAndCount();
  }

  private async fetchRepository(
    repository: Repository<T>,
    options: PaginatorOptions<T>
  ) {
    const findOptions = this.resolveFindOptions(options);
    return repository.findAndCount(findOptions);
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

  private resolveFindOptions(options: PaginatorOptions<T>): FindManyOptions<T> {
    const { limit, page, query = {} } = options;

    const skip = (page - 1) * limit;

    return {
      skip,
      take: limit,
      ...query,
    };
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
