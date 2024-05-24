import type { EntityManager, EntityTarget } from 'typeorm';

import { DEFAULT_MOCK_DATA_AMOUNT } from 'tests/constants';

import type { MockEntity } from '../mocks';

import { RepositoryMock, generateMockItems } from '../mocks';

export const repositoryMockFactory = (
  dataAmount: number = DEFAULT_MOCK_DATA_AMOUNT
): RepositoryMock<MockEntity> => {
  const target = {} as EntityTarget<MockEntity>;
  const entityManager = {} as EntityManager;
  const mockItems = generateMockItems(dataAmount);

  return new RepositoryMock(target, entityManager, mockItems);
};
