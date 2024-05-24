import { faker } from '@faker-js/faker';

const buildMockItem = () => ({
  createdAt: faker.date.recent(),
  description: faker.lorem.lines(),
  id: faker.string.uuid(),
  name: faker.person.fullName(),
});

export const generateMockItems = (amount: number) => {
  const items = [];

  for (let i = 0; i < amount; i += 1) {
    items.push(buildMockItem());
  }

  return items;
};
