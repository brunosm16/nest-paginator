import type { Repository, SelectQueryBuilder } from 'typeorm';

import { Paginator } from '@/classes/paginator';
import paginator from '@/factories/make-paginator';
import { zodValidate } from '@/validation/zod-validate';

import type { UserEntity } from '../../tests/entities';

import { sqliteDatabaseTestFactory } from '../../tests/factories/sqlite-database-test-factory';

jest.mock('@/validation/zod-validate');

interface SutType {
  sut: Paginator<UserEntity>;
}

const makeSut = () => {
  const sut = paginator<UserEntity>();

  return {
    sut,
  } as SutType;
};

const DATABASE_MOCK_ITEMS_AMOUNT = 100;

describe('Paginator Tests', () => {
  const testingDatabase = sqliteDatabaseTestFactory();
  let UserEntityRepository: Repository<UserEntity> = null;
  let mockQueryBuilder: SelectQueryBuilder<UserEntity> = null;

  beforeAll(async () => {
    await testingDatabase.initialize();
    await testingDatabase.seed(DATABASE_MOCK_ITEMS_AMOUNT);

    UserEntityRepository = testingDatabase.UserEntityRepository;
    mockQueryBuilder = UserEntityRepository.createQueryBuilder('u');
  });

  afterAll(async () => {
    await testingDatabase.clearDatabase();
    await testingDatabase.closeDatabase();
  });

  describe('.paginator instance', () => {
    it('Should create a Paginator instance correctly', () => {
      const { sut } = makeSut();
      expect(sut).toBeInstanceOf(Paginator);
    });

    it('Should catch zod error', async () => {
      const { sut } = makeSut();

      const zodValidateMock = zodValidate as jest.Mock<
        ReturnType<typeof zodValidate>
      >;

      zodValidateMock.mockImplementationOnce(() => {
        throw new Error('Mock Error');
      });

      const promise = sut.paginate(UserEntityRepository, { limit: 6, page: 1 });
      expect(promise).rejects.toThrow('Mock Error');
    });
  });

  describe('.paginate with repository', () => {
    it('Should paginate to first page', async () => {
      const { sut } = makeSut();

      const findAndCountSpy = jest.spyOn(UserEntityRepository, 'findAndCount');

      const { responseData, responseInformation } = await sut.paginate(
        UserEntityRepository,
        { limit: 10, page: 1 }
      );

      expect(findAndCountSpy).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });

      expect(responseData).toEqual(expect.any(Array<UserEntity>));
      expect(responseData[0].user_id).toEqual(1);

      expect(responseInformation).toEqual(
        expect.objectContaining({
          limitRows: 10,
          pages: expect.objectContaining({
            currentPage: 1,
            lastPage: 10,
            nextPage: 2,
            previousPage: null,
          }),
          totalRows: 100,
        })
      );
    });

    it('Should paginate to random page', async () => {
      const { sut } = makeSut();

      const findAndCountSpy = jest.spyOn(UserEntityRepository, 'findAndCount');

      const { responseData, responseInformation } = await sut.paginate(
        UserEntityRepository,
        { limit: 10, page: 5 }
      );

      expect(findAndCountSpy).toHaveBeenCalledWith({
        skip: 40,
        take: 10,
      });

      expect(responseData).toEqual(expect.any(Array<UserEntity>));
      expect(responseData[0].user_id).toEqual(41);

      expect(responseInformation).toEqual(
        expect.objectContaining({
          limitRows: 10,
          pages: expect.objectContaining({
            currentPage: 5,
            lastPage: 10,
            nextPage: 6,
            previousPage: 4,
          }),
          totalRows: 100,
        })
      );
    });

    it('Should paginate to last page', async () => {
      const { sut } = makeSut();

      const findAndCountSpy = jest.spyOn(UserEntityRepository, 'findAndCount');

      const { responseData, responseInformation } = await sut.paginate(
        UserEntityRepository,
        { limit: 10, page: 10 }
      );

      expect(findAndCountSpy).toHaveBeenCalledWith({
        skip: 90,
        take: 10,
      });

      expect(responseData).toEqual(expect.any(Array<UserEntity>));
      expect(responseData[0].user_id).toEqual(91);

      expect(responseInformation).toEqual(
        expect.objectContaining({
          limitRows: 10,
          pages: expect.objectContaining({
            currentPage: 10,
            lastPage: 10,
            nextPage: null,
            previousPage: 9,
          }),
          totalRows: 100,
        })
      );
    });

    it('Should catch error when paginating data with repository', async () => {
      const { sut } = makeSut();

      jest
        .spyOn(UserEntityRepository, 'findAndCount')
        .mockImplementationOnce(() => {
          throw new Error('Mock Repository Error');
        });

      const result = sut.paginate(UserEntityRepository, { limit: 1, page: 10 });

      await expect(result).rejects.toThrow('Mock Repository Error');
    });

    it("Should return empty pages when it's beyond the last page for pagination with repository", async () => {
      const { sut } = makeSut();

      const { responseData, responseInformation } = await sut.paginate(
        UserEntityRepository,
        { limit: 6, page: 50 }
      );
      const { pages } = responseInformation;

      expect(pages.nextPage).toEqual(null);
      expect(pages.previousPage).toEqual(null);
      expect(responseData).toEqual(expect.any(Array<UserEntity>));
      expect(responseData.length).toEqual(0);
    });

    it('Should paginate with query option', async () => {
      const { sut } = makeSut();

      const findAndCountSpy = jest.spyOn(UserEntityRepository, 'findAndCount');

      const { responseData, responseInformation } = await sut.paginate(
        UserEntityRepository,
        { limit: 10, page: 1, query: { where: { user_id: 1 } } }
      );

      expect(findAndCountSpy).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { user_id: 1 },
      });

      expect(responseData).toEqual(expect.any(Array<UserEntity>));
      expect(responseData[0].user_id).toEqual(1);

      expect(responseInformation).toEqual(
        expect.objectContaining({
          limitRows: 10,
          pages: expect.objectContaining({
            currentPage: 1,
            lastPage: 1,
            nextPage: null,
            previousPage: null,
          }),
          totalRows: 1,
        })
      );
    });
  });

  describe('.paginate with query builder', () => {
    it('Should paginate to first page with query builder', async () => {
      const { sut } = makeSut();

      const getManyAndCount = jest.spyOn(mockQueryBuilder, 'getManyAndCount');
      const limitSpy = jest.spyOn(mockQueryBuilder, 'limit');
      const offsetSpy = jest.spyOn(mockQueryBuilder, 'offset');

      const { responseData, responseInformation } = await sut.paginate(
        mockQueryBuilder,
        { limit: 10, page: 1 }
      );

      expect(limitSpy).toHaveBeenCalledWith(10);
      expect(offsetSpy).toHaveBeenCalledWith(0);
      expect(getManyAndCount).toHaveBeenCalled();

      expect(responseData).toEqual(expect.any(Array<UserEntity>));
      expect(responseData[0].user_id).toEqual(1);

      expect(responseInformation).toEqual(
        expect.objectContaining({
          limitRows: 10,
          pages: expect.objectContaining({
            currentPage: 1,
            lastPage: 10,
            nextPage: 2,
            previousPage: null,
          }),
          totalRows: 100,
        })
      );
    });

    it('Should paginate to random page with query builder', async () => {
      const { sut } = makeSut();

      const getManyAndCount = jest.spyOn(mockQueryBuilder, 'getManyAndCount');
      const limitSpy = jest.spyOn(mockQueryBuilder, 'limit');
      const offsetSpy = jest.spyOn(mockQueryBuilder, 'offset');

      const { responseData, responseInformation } = await sut.paginate(
        mockQueryBuilder,
        { limit: 10, page: 5 }
      );

      expect(limitSpy).toHaveBeenCalledWith(10);
      expect(offsetSpy).toHaveBeenCalledWith(40);
      expect(getManyAndCount).toHaveBeenCalled();

      expect(responseData).toEqual(expect.any(Array<UserEntity>));
      expect(responseData[0].user_id).toEqual(41);

      expect(responseInformation).toEqual(
        expect.objectContaining({
          limitRows: 10,
          pages: expect.objectContaining({
            currentPage: 5,
            lastPage: 10,
            nextPage: 6,
            previousPage: 4,
          }),
          totalRows: 100,
        })
      );
    });

    it('Should paginate to last page with query builder', async () => {
      const { sut } = makeSut();

      const getManyAndCount = jest.spyOn(mockQueryBuilder, 'getManyAndCount');
      const limitSpy = jest.spyOn(mockQueryBuilder, 'limit');
      const offsetSpy = jest.spyOn(mockQueryBuilder, 'offset');

      const { responseData, responseInformation } = await sut.paginate(
        mockQueryBuilder,
        { limit: 10, page: 10 }
      );

      expect(limitSpy).toHaveBeenCalledWith(10);
      expect(offsetSpy).toHaveBeenCalledWith(90);
      expect(getManyAndCount).toHaveBeenCalled();

      expect(responseData).toEqual(expect.any(Array<UserEntity>));
      expect(responseData[0].user_id).toEqual(91);

      expect(responseInformation).toEqual(
        expect.objectContaining({
          limitRows: 10,
          pages: expect.objectContaining({
            currentPage: 10,
            lastPage: 10,
            nextPage: null,
            previousPage: 9,
          }),
          totalRows: 100,
        })
      );
    });

    it('Should catch error when paginating data with query builder', async () => {
      const { sut } = makeSut();

      jest
        .spyOn(mockQueryBuilder, 'getManyAndCount')
        .mockImplementationOnce(() => {
          throw new Error('Mock Error');
        });

      const result = sut.paginate(mockQueryBuilder, { limit: 1, page: 5 });

      await expect(result).rejects.toThrow('Mock Error');
    });

    it("Should return empty pages when it's beyond the last page with query builder", async () => {
      const { sut } = makeSut();

      const { responseData, responseInformation } = await sut.paginate(
        mockQueryBuilder,
        { limit: 6, page: 50 }
      );
      const { pages } = responseInformation;

      expect(pages.nextPage).toEqual(null);
      expect(pages.previousPage).toEqual(null);
      expect(responseData).toEqual(expect.any(Array<UserEntity>));
    });

    it('Should catch zod error with query builder', async () => {
      const { sut } = makeSut();

      const zodValidateMock = zodValidate as jest.Mock<
        ReturnType<typeof zodValidate>
      >;

      zodValidateMock.mockImplementationOnce(() => {
        throw new Error('Mock Error');
      });

      const promise = sut.paginate(mockQueryBuilder, { limit: 6, page: 1 });
      expect(promise).rejects.toThrow('Mock Error');
    });
  });

  describe('.paginate with query builder - raw pagination', () => {
    it('Should paginate to first page with query builder - raw pagination', async () => {
      const groupByQueryBuilder = testingDatabase.groupByStateQuery;

      const { sut } = makeSut();

      const getRawMany = jest.spyOn(groupByQueryBuilder, 'getRawMany');
      const limitSpy = jest.spyOn(groupByQueryBuilder, 'limit');
      const offsetSpy = jest.spyOn(groupByQueryBuilder, 'offset');

      const { responseData, responseInformation } = await sut.paginate(
        groupByQueryBuilder,
        {
          isRawPagination: true,
          limit: 10,
          page: 1,
        }
      );

      expect(limitSpy).toHaveBeenCalledWith(10);
      expect(offsetSpy).toHaveBeenCalledWith(0);
      expect(getRawMany).toHaveBeenCalled();

      expect(responseData).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            state_name: expect.any(String),
            users_state_count: expect.any(Number),
          }),
        ])
      );

      expect(responseInformation).toEqual(
        expect.objectContaining({
          limitRows: 10,
          pages: expect.objectContaining({
            currentPage: 1,
            lastPage: 10,
            nextPage: 2,
            previousPage: null,
          }),
          totalRows: 100,
        })
      );
    });

    it('Should paginate to random page with query builder - raw pagination', async () => {
      const groupByQueryBuilder = testingDatabase.groupByStateQuery;

      const { sut } = makeSut();

      const getRawMany = jest.spyOn(groupByQueryBuilder, 'getRawMany');
      const limitSpy = jest.spyOn(groupByQueryBuilder, 'limit');
      const offsetSpy = jest.spyOn(groupByQueryBuilder, 'offset');

      const { responseData, responseInformation } = await sut.paginate(
        groupByQueryBuilder,
        {
          isRawPagination: true,
          limit: 10,
          page: 5,
        }
      );

      expect(limitSpy).toHaveBeenCalledWith(10);
      expect(offsetSpy).toHaveBeenCalledWith(40);
      expect(getRawMany).toHaveBeenCalled();

      expect(responseData).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            state_name: expect.any(String),
            users_state_count: expect.any(Number),
          }),
        ])
      );

      expect(responseInformation).toEqual(
        expect.objectContaining({
          limitRows: 10,
          pages: expect.objectContaining({
            currentPage: 5,
            lastPage: 10,
            nextPage: 6,
            previousPage: 4,
          }),
          totalRows: 100,
        })
      );
    });

    it('Should catch error when paginating data with query builder - raw pagination', async () => {
      const groupByQueryBuilder = testingDatabase.groupByStateQuery;

      const { sut } = makeSut();

      jest
        .spyOn(groupByQueryBuilder, 'getRawMany')
        .mockImplementationOnce(() => {
          throw new Error('Mock Error');
        });

      const result = sut.paginate(groupByQueryBuilder, {
        isRawPagination: true,
        limit: 1,
        page: 5,
      });

      await expect(result).rejects.toThrow('Mock Error');
    });

    it("Should return empty pages when it's beyond the last page with query builder - raw pagination", async () => {
      const groupByQueryBuilder = testingDatabase.groupByStateQuery;

      const { sut } = makeSut();

      const { responseInformation } = await sut.paginate(groupByQueryBuilder, {
        isRawPagination: true,
        limit: 6,
        page: 50,
      });
      const { pages } = responseInformation;

      expect(pages.nextPage).toEqual(null);
      expect(pages.previousPage).toEqual(null);
    });

    it('Should catch zod error with query builder - raw pagination', async () => {
      const groupByQueryBuilder = testingDatabase.groupByStateQuery;

      const { sut } = makeSut();

      const zodValidateMock = zodValidate as jest.Mock<
        ReturnType<typeof zodValidate>
      >;

      zodValidateMock.mockImplementationOnce(() => {
        throw new Error('Mock Error');
      });

      const promise = sut.paginate(groupByQueryBuilder, {
        isRawPagination: true,
        limit: 6,
        page: 1,
      });
      expect(promise).rejects.toThrow('Mock Error');
    });
  });
});
