import type { EntityManager, EntityTarget, FindManyOptions } from 'typeorm';

import { Repository } from 'typeorm';

import {
  DEFAULT_MOCK_LIMIT_FIND,
  DEFAULT_MOCK_REPOSITORY_ITEMS,
} from '../constants';
import { mockArrayOfEntities } from './mock-array-entities';

export class RepositoryMock<T> extends Repository<T> {
  private readonly mockItems: T[] = [];

  constructor(
    target: EntityTarget<T>,
    entityManager: EntityManager,
    amountItems: number = DEFAULT_MOCK_REPOSITORY_ITEMS
  ) {
    super(target, entityManager);
    this.setMockItems(amountItems);
  }

  private setMockItems(amountItems: number): void {
    const items = mockArrayOfEntities(amountItems);
    this.mockItems.push(...items);
  }

  public async findAndCount(
    findOptions: FindManyOptions<T>
  ): Promise<[T[], number]> {
    const limit = findOptions?.take ?? DEFAULT_MOCK_LIMIT_FIND;
    const result = this.mockItems.slice(0, limit);
    return [result, this.mockItems.length];
  }
}
