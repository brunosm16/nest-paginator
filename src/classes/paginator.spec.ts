import type { Repository } from 'typeorm';

import { Paginator } from '@/classes/paginator';
import paginator from '@/factories/make-paginator';
import { zodValidate } from '@/validation/zod-validate';

import type { MockEntity } from '../../tests/mocks';

import { repositoryMockFactory } from '../../tests/factories';

jest.mock('@/validation/zod-validate');

interface SutType {
  repository: Repository<MockEntity>;
  sut: Paginator<MockEntity>;
}

const makeSut = (itemsAmount?: number) => {
  const repository = repositoryMockFactory(itemsAmount);
  const sut = paginator<MockEntity>();

  return {
    repository,
    sut,
  } as SutType;
};

describe('Paginator Tests', () => {
  it('Should create a Paginator instance correctly', () => {
    const { sut } = makeSut();
    expect(sut).toBeInstanceOf(Paginator);
  });

  it('Should paginate to first page', async () => {
    const { repository, sut } = makeSut(100);

    const { responseData, responseInformation } = await sut.paginate(
      repository,
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
    const { repository, sut } = makeSut(100);

    const { responseData, responseInformation } = await sut.paginate(
      repository,
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
    const { repository, sut } = makeSut(100);

    const { responseData, responseInformation } = await sut.paginate(
      repository,
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
    const { repository, sut } = makeSut(100);

    const response = await sut.paginate(repository, {
      limit: 6,
      page: 1,
    });

    const { pages } = response.responseInformation;

    expect(pages.previousPage).toEqual(null);
    expect(pages.nextPage).toEqual(2);
  });

  it('Should not return next when it reaches data set limit', async () => {
    const { repository, sut } = makeSut(100);

    const response = await sut.paginate(repository, {
      limit: 6,
      page: 17,
    });

    const { pages } = response.responseInformation;

    expect(pages.nextPage).toEqual(null);
    expect(pages.previousPage).toEqual(16);
  });

  it('Should catch error when paginating data', async () => {
    const { repository, sut } = makeSut(100);

    jest.spyOn(repository, 'findAndCount').mockImplementationOnce(() => {
      throw new Error('Mock Error');
    });

    const result = sut.paginate(repository, { limit: 1, page: 5 });

    await expect(result).rejects.toThrow('Mock Error');
  });

  it('Should resolve page to zero when its first page', async () => {
    const { repository, sut } = makeSut(100);

    const findAndCountSpy = jest.spyOn(repository, 'findAndCount');

    await sut.paginate(repository, {
      limit: 6,
      page: 1,
    });

    expect(findAndCountSpy).toHaveBeenCalledWith({
      skip: 0,
      take: 6,
    });
  });

  it('Should resolve page when page its greater than 1', async () => {
    const { repository, sut } = makeSut(100);

    const findAndCountSpy = jest.spyOn(repository, 'findAndCount');

    const options = {
      limit: 6,
      page: 5,
    };

    await sut.paginate(repository, options);

    const expectedSkip = (options.page - 1) * 6;

    expect(findAndCountSpy).toHaveBeenCalledWith({
      skip: expectedSkip,
      take: 6,
    });
  });

  it("Should resolve pages when it's beyond the last page", async () => {
    const { repository, sut } = makeSut(100);

    const { responseData, responseInformation } = await sut.paginate(
      repository,
      { limit: 6, page: 50 }
    );
    const { pages } = responseInformation;

    expect(pages.nextPage).toEqual(null);
    expect(pages.previousPage).toEqual(null);
    expect(responseData).toEqual(expect.any(Array<MockEntity>));
  });

  it('Should translate zod error', async () => {
    const { repository, sut } = makeSut(100);

    const zodValidateMock = zodValidate as jest.Mock<
      ReturnType<typeof zodValidate>
    >;

    zodValidateMock.mockImplementationOnce(() => {
      throw new Error('Mock Error');
    });

    const promise = sut.paginate(repository, { limit: 6, page: 1 });
    expect(promise).rejects.toThrow('Mock Error');
  });
});
