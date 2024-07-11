import type { EntityManager, EntityTarget } from 'typeorm';

import type { UserEntity } from '../mocks';

import { DEFAULT_MOCK_REPOSITORY_ITEMS } from '../constants';
import { RepositoryMock } from '../mocks';

export const repositoryMockFactory = (
  amountItems: number = DEFAULT_MOCK_REPOSITORY_ITEMS
): RepositoryMock<UserEntity> => {
  const target = {} as EntityTarget<UserEntity>;
  const entityManager = {} as EntityManager;

  return new RepositoryMock(target, entityManager, amountItems);
};
