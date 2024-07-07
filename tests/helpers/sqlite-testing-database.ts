/* eslint-disable no-useless-catch */
import type { DataSourceOptions } from 'typeorm';

import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { MockEntity } from '../mocks';

export class SQLiteTestingDatabase {
  private dataSource: DataSource;

  constructor() {
    this.initialize();
  }

  private get dataSourceConfiguration() {
    return {
      database: ':memory:',
      dropSchema: true,
      entities: [MockEntity],
      synchronize: true,
      type: 'better-sqlite3',
    };
  }

  private mockTestEntity(): Partial<MockEntity> {
    return {
      description: faker.lorem.lines(),
      name: faker.person.fullName(),
    };
  }

  public async clearDatabase(): Promise<void> {
    try {
      const mockEntityRepository = this.dataSource.getRepository(MockEntity);

      await mockEntityRepository.clear();
    } catch (err) {
      throw err;
    }
  }

  public async closeDatabase(): Promise<void> {
    try {
      await this.dataSource.destroy();
    } catch (err) {
      throw err;
    }
  }

  public async initialize(): Promise<void> {
    try {
      this.dataSource = new DataSource(
        this.dataSourceConfiguration as DataSourceOptions
      );

      await this.dataSource.initialize();
    } catch (err) {
      throw err;
    }
  }

  public async seed(itemsAmount: number): Promise<number> {
    try {
      const mockEntityRepository = this.dataSource.getRepository(MockEntity);

      const promises = [];

      for (let i = 0; i < itemsAmount; i += 1) {
        const entity = this.mockTestEntity();
        promises.push(mockEntityRepository.insert(entity));
      }

      const result = await Promise.all(promises);
      return result?.length;
    } catch (error) {
      throw error;
    }
  }

  public get mockEntityRepository() {
    return this.dataSource.getRepository(MockEntity);
  }
}
