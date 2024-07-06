import { faker } from '@faker-js/faker';

import type { MockEntity } from './mock-entity';

const mockTestEntity = (): MockEntity => ({
  createdAt: faker.date.recent(),
  description: faker.lorem.lines(),
  id: faker.string.uuid(),
  name: faker.person.fullName(),
});

export const mockArrayOfEntities = (limit: number) => {
  const items = [];

  for (let i = 0; i < limit; i += 1) {
    items.push(mockTestEntity());
  }

  return items;
};
