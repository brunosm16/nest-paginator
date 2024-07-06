import type { EntityManager, EntityTarget } from 'typeorm';

import type { MockEntity } from '../mocks';

import { DEFAULT_MOCK_REPOSITORY_ITEMS } from '../constants';
import { RepositoryMock } from '../mocks';

export const repositoryMockFactory = (
  amountItems: number = DEFAULT_MOCK_REPOSITORY_ITEMS
): RepositoryMock<MockEntity> => {
  const target = {} as EntityTarget<MockEntity>;
  const entityManager = {} as EntityManager;

  return new RepositoryMock(target, entityManager, amountItems);
};
