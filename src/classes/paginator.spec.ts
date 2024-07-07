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
  let mockEntityRepository = null;

  beforeAll(async () => {
    await testingDatabase.initialize();
    await testingDatabase.seed(DATABASE_MOCK_ITEMS_AMOUNT);
    mockEntityRepository = testingDatabase.mockEntityRepository;
  });

  afterAll(async () => {
    await testingDatabase.clearDatabase();
    await testingDatabase.closeDatabase();
  });

  it('Should create a Paginator instance correctly', () => {
    const { sut } = makeSut();
    expect(sut).toBeInstanceOf(Paginator);
  });

  it('Should paginate to first page', async () => {
    const { sut } = makeSut();

    const { responseData, responseInformation } = await sut.paginate(
      mockEntityRepository,
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

  it('Should paginate to random page', async () => {
    const { sut } = makeSut();

    const { responseData, responseInformation } = await sut.paginate(
      mockEntityRepository,
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

  it('Should paginate to last page', async () => {
    const { sut } = makeSut();

    const { responseData, responseInformation } = await sut.paginate(
      mockEntityRepository,
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

  it('Should not return previous for first page', async () => {
    const { sut } = makeSut();

    const response = await sut.paginate(mockEntityRepository, {
      limit: 6,
      page: 1,
    });

    const { pages } = response.responseInformation;

    expect(pages.previousPage).toEqual(null);
    expect(pages.nextPage).toEqual(2);
  });

  it('Should not return next when it reaches data set limit', async () => {
    const { sut } = makeSut();

    const response = await sut.paginate(mockEntityRepository, {
      limit: 6,
      page: 17,
    });

    const { pages } = response.responseInformation;

    expect(pages.nextPage).toEqual(null);
    expect(pages.previousPage).toEqual(16);
  });

  it('Should catch error when paginating data', async () => {
    const { sut } = makeSut();

    jest
      .spyOn(mockEntityRepository, 'findAndCount')
      .mockImplementationOnce(() => {
        throw new Error('Mock Error');
      });

    const result = sut.paginate(mockEntityRepository, { limit: 1, page: 5 });

    await expect(result).rejects.toThrow('Mock Error');
  });

  it('Should resolve page to zero when its first page', async () => {
    const { sut } = makeSut();

    const findAndCountSpy = jest.spyOn(mockEntityRepository, 'findAndCount');

    await sut.paginate(mockEntityRepository, {
      limit: 6,
      page: 1,
    });

    expect(findAndCountSpy).toHaveBeenCalledWith({
      skip: 0,
      take: 6,
    });
  });

  it('Should resolve page when page its greater than 1', async () => {
    const { sut } = makeSut();

    const findAndCountSpy = jest.spyOn(mockEntityRepository, 'findAndCount');

    const options = {
      limit: 6,
      page: 5,
    };

    await sut.paginate(mockEntityRepository, options);

    const expectedSkip = (options.page - 1) * 6;

    expect(findAndCountSpy).toHaveBeenCalledWith({
      skip: expectedSkip,
      take: 6,
    });
  });

  it("Should resolve pages when it's beyond the last page", async () => {
    const { sut } = makeSut();

    const { responseData, responseInformation } = await sut.paginate(
      mockEntityRepository,
      { limit: 6, page: 50 }
    );
    const { pages } = responseInformation;

    expect(pages.nextPage).toEqual(null);
    expect(pages.previousPage).toEqual(null);
    expect(responseData).toEqual(expect.any(Array<MockEntity>));
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
