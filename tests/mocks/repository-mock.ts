import type { EntityManager, EntityTarget, FindManyOptions } from 'typeorm';

import { Repository } from 'typeorm';

import { DEFAULT_MOCK_LIMIT } from '../constants';

export class RepositoryMock<T> extends Repository<T> {
  private readonly mockItems: T[] = [];

  constructor(
    target: EntityTarget<T>,
    entityManager: EntityManager,
    items: T[] = []
  ) {
    super(target, entityManager);
    this.setMockItems(items);
  }

  private setMockItems(items: T[] = []): void {
    this.mockItems.push(...items);
  }

  public async findAndCount(
    findOptions: FindManyOptions<T>
  ): Promise<[T[], number]> {
    const limit = findOptions?.take ?? DEFAULT_MOCK_LIMIT;
    const result = this.mockItems.slice(0, limit);
    return [result, this.mockItems.length];
  }
}
