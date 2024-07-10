import type { Repository, SelectQueryBuilder } from 'typeorm';

import { Paginator } from '@/classes/paginator';
import paginator from '@/factories/make-paginator';
import { zodValidate } from '@/validation/zod-validate';

import type { MockEntity } from '../../tests/mocks';

import { sqliteDatabaseTestFactory } from '../../tests/factories/sqlite-database-test-factory';

jest.mock('@/validation/zod-validate');

interface SutType {
  sut: Paginator<MockEntity>;
}

const makeSut = () => {
  const sut = paginator<MockEntity>();

  return {
    sut,
  } as SutType;
};

const DATABASE_MOCK_ITEMS_AMOUNT = 100;

describe('Paginator Tests', () => {
  const testingDatabase = sqliteDatabaseTestFactory();
  let mockEntityRepository: Repository<MockEntity> = null;
  let mockQueryBuilder: SelectQueryBuilder<MockEntity> = null;

  beforeAll(async () => {
    await testingDatabase.initialize();
    await testingDatabase.seed(DATABASE_MOCK_ITEMS_AMOUNT);

    mockEntityRepository = testingDatabase.mockEntityRepository;
    mockQueryBuilder = mockEntityRepository.createQueryBuilder();
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

      const promise = sut.paginate(mockEntityRepository, { limit: 6, page: 1 });
      expect(promise).rejects.toThrow('Mock Error');
    });
  });

  describe('.paginate with repository', () => {
    it('Should paginate to first page', async () => {
      const { sut } = makeSut();

      const findAndCountSpy = jest.spyOn(mockEntityRepository, 'findAndCount');

      const { responseData, responseInformation } = await sut.paginate(
        mockEntityRepository,
        { limit: 10, page: 1 }
      );

      expect(findAndCountSpy).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });

      expect(responseData).toEqual(expect.any(Array<MockEntity>));
      expect(responseData[0].id).toEqual(1);

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

      const findAndCountSpy = jest.spyOn(mockEntityRepository, 'findAndCount');

      const { responseData, responseInformation } = await sut.paginate(
        mockEntityRepository,
        { limit: 10, page: 5 }
      );

      expect(findAndCountSpy).toHaveBeenCalledWith({
        skip: 40,
        take: 10,
      });

      expect(responseData).toEqual(expect.any(Array<MockEntity>));
      expect(responseData[0].id).toEqual(41);

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

      const findAndCountSpy = jest.spyOn(mockEntityRepository, 'findAndCount');

      const { responseData, responseInformation } = await sut.paginate(
        mockEntityRepository,
        { limit: 10, page: 10 }
      );

      expect(findAndCountSpy).toHaveBeenCalledWith({
        skip: 90,
        take: 10,
      });

      expect(responseData).toEqual(expect.any(Array<MockEntity>));
      expect(responseData[0].id).toEqual(91);

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
        .spyOn(mockEntityRepository, 'findAndCount')
        .mockImplementationOnce(() => {
          throw new Error('Mock Repository Error');
        });

      const result = sut.paginate(mockEntityRepository, { limit: 1, page: 10 });

      await expect(result).rejects.toThrow('Mock Repository Error');
    });

    it("Should return empty pages when it's beyond the last page for pagination with repository", async () => {
      const { sut } = makeSut();

      const { responseData, responseInformation } = await sut.paginate(
        mockEntityRepository,
        { limit: 6, page: 50 }
      );
      const { pages } = responseInformation;

      expect(pages.nextPage).toEqual(null);
      expect(pages.previousPage).toEqual(null);
      expect(responseData).toEqual(expect.any(Array<MockEntity>));
      expect(responseData.length).toEqual(0);
    });
  });

  it('Should paginate with query builder to first page', async () => {
    const { sut } = makeSut();

    const { responseData, responseInformation } = await sut.paginate(
      mockQueryBuilder,
      { limit: 6, page: 1 }
    );
    const { currentPage, lastPage, nextPage, previousPage } =
      responseInformation.pages;

    expect(responseData).toEqual(expect.any(Array<MockEntity>));
    expect(responseInformation.totalRows).toEqual(100);
    expect(responseInformation.limitRows).toEqual(6);
    expect(currentPage).toEqual(1);
    expect(lastPage).toEqual(17);
    expect(nextPage).toEqual(2);
    expect(previousPage).toEqual(null);
  });

  it('Should paginate with query builder to random page', async () => {
    const { sut } = makeSut();

    const { responseData, responseInformation } = await sut.paginate(
      mockQueryBuilder,
      { limit: 6, page: 4 }
    );
    const { currentPage, lastPage, nextPage, previousPage } =
      responseInformation.pages;

    expect(responseData).toEqual(expect.any(Array<MockEntity>));
    expect(responseInformation.totalRows).toEqual(100);
    expect(responseInformation.limitRows).toEqual(6);
    expect(currentPage).toEqual(4);
    expect(lastPage).toEqual(17);
    expect(nextPage).toEqual(5);
    expect(previousPage).toEqual(3);
  });

  it('Should paginate with query builder to last page', async () => {
    const { sut } = makeSut();

    const { responseData, responseInformation } = await sut.paginate(
      mockQueryBuilder,
      { limit: 6, page: 17 }
    );
    const { currentPage, lastPage, nextPage, previousPage } =
      responseInformation.pages;

    expect(responseData).toEqual(expect.any(Array<MockEntity>));
    expect(responseInformation.totalRows).toEqual(100);
    expect(responseInformation.limitRows).toEqual(6);
    expect(currentPage).toEqual(17);
    expect(lastPage).toEqual(17);
    expect(nextPage).toEqual(null);
    expect(previousPage).toEqual(16);
  });

  it('Should not return previous for first page with query builder', async () => {
    const { sut } = makeSut();

    const response = await sut.paginate(mockQueryBuilder, {
      limit: 6,
      page: 1,
    });

    const { pages } = response.responseInformation;

    expect(pages.previousPage).toEqual(null);
    expect(pages.nextPage).toEqual(2);
  });

  it('Should not return next when it reaches data set limit with query builder', async () => {
    const { sut } = makeSut();

    const response = await sut.paginate(mockQueryBuilder, {
      limit: 6,
      page: 17,
    });

    const { pages } = response.responseInformation;

    expect(pages.nextPage).toEqual(null);
    expect(pages.previousPage).toEqual(16);
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

  it("Should resolve pages when it's beyond the last page with query builder", async () => {
    const { sut } = makeSut();

    const { responseData, responseInformation } = await sut.paginate(
      mockQueryBuilder,
      { limit: 6, page: 50 }
    );
    const { pages } = responseInformation;

    expect(pages.nextPage).toEqual(null);
    expect(pages.previousPage).toEqual(null);
    expect(responseData).toEqual(expect.any(Array<MockEntity>));
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
