/* eslint-disable no-useless-catch */
import type { DataSourceOptions } from 'typeorm';

import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { UserEntity } from '../entities';

export class SQLiteTestingDatabase {
  private dataSource: DataSource;

  constructor() {
    this.initialize();
  }

  private get dataSourceConfiguration() {
    return {
      database: ':memory:',
      dropSchema: true,
      entities: [UserEntity],
      synchronize: true,
      type: 'better-sqlite3',
    };
  }

  private mockUserEntity(): Partial<UserEntity> {
    return {
      address: faker.location.streetAddress(),
      email: faker.internet.email(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      state: faker.location.state(),
      zip_code: faker.location.zipCode(),
    };
  }

  public async clearDatabase(): Promise<void> {
    try {
      const UserEntityRepository = this.dataSource.getRepository(UserEntity);

      await UserEntityRepository.clear();
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
      const UserEntityRepository = this.dataSource.getRepository(UserEntity);

      const promises = [];

      for (let i = 0; i < itemsAmount; i += 1) {
        const entity = this.mockUserEntity();
        promises.push(UserEntityRepository.insert(entity));
      }

      const result = await Promise.all(promises);
      return result?.length;
    } catch (error) {
      throw error;
    }
  }

  public get UserEntityRepository() {
    return this.dataSource.getRepository(UserEntity);
  }

  public get groupByStateQuery() {
    const queryBuilder = this.UserEntityRepository.createQueryBuilder('u');

    return queryBuilder
      .select('u.state', 'state_name')
      .addSelect('COUNT(u.state)', 'users_state_count')
      .groupBy('u.state')
      .orderBy('u.state', 'ASC');
  }
}
