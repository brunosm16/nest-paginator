import type { Repository } from 'typeorm';

import { Paginator } from '@/classes/paginator';
import paginator from '@/factories/make-paginator';

import type { MockEntity } from './mocks';

import { repositoryMockFactory } from './factories';

interface SutType {
  repository: Repository<MockEntity>;
  sut: Paginator<MockEntity>;
}

const makeSut = (amountData?: number) => {
  const repository = repositoryMockFactory(amountData);
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

    const result = await sut.paginate(repository, {
      limit: 6,
      page: 1,
    });

    expect(result.data.length).toEqual(6);
    expect(result.dataCount).toEqual(6);
    expect(result.pageDataCount).toEqual(17);
    expect(result.totalData).toEqual(100);
  });

  it('Should paginate to random page', async () => {
    const { repository, sut } = makeSut(100);

    const properties = {
      limit: 4,
      page: 1,
    };

    await sut.paginate(repository, properties);

    const result = await sut.paginate(repository, {
      ...properties,
      page: 12,
    });

    expect(result.data.length).toEqual(4);
    expect(result.dataCount).toEqual(4);
    expect(result.pageDataCount).toEqual(25);
    expect(result.totalData).toEqual(100);
  });

  it('Should paginate to last page', async () => {
    const { repository, sut } = makeSut(100);

    const result = await sut.paginate(repository, {
      limit: 6,
      page: 16,
    });

    expect(result.data.length).toEqual(6);
    expect(result.dataCount).toEqual(6);
    expect(result.pageDataCount).toEqual(17);
    expect(result.totalData).toEqual(100);
  });

  it('Should paginate with route', async () => {
    const { repository, sut } = makeSut(100);

    const result = await sut.paginate(repository, {
      limit: 6,
      page: 5,
      route: 'http://mock-endpoint.com/data',
    });

    expect(result.data.length).toEqual(6);
    expect(result.dataCount).toEqual(6);
    expect(result.pageDataCount).toEqual(17);
    expect(result.totalData).toEqual(100);
    expect(result.routes.previousPage).toEqual(
      'http://mock-endpoint.com/data?page=4'
    );
    expect(result.routes.nextPage).toEqual(
      'http://mock-endpoint.com/data?page=6'
    );
  });

  it('Should not return previous for first page', async () => {
    const { repository, sut } = makeSut(100);

    const result = await sut.paginate(repository, {
      limit: 6,
      page: 1,
      route: 'http://mock-endpoint.com/data',
    });

    expect(result.data.length).toEqual(6);
    expect(result.dataCount).toEqual(6);
    expect(result.pageDataCount).toEqual(17);
    expect(result.totalData).toEqual(100);
    expect(result.routes.previousPage).toEqual(null);
    expect(result.routes.nextPage).toEqual(
      `http://mock-endpoint.com/data?page=2`
    );
  });

  it('Should not set nextPage when it reaches data set limit', async () => {
    const { repository, sut } = makeSut(100);

    const result = await sut.paginate(repository, {
      limit: 6,
      page: 17,
      route: 'http://mock-endpoint.com/data',
    });

    expect(result.data.length).toEqual(6);
    expect(result.dataCount).toEqual(6);
    expect(result.pageDataCount).toEqual(17);
    expect(result.totalData).toEqual(100);
    expect(result.routes.previousPage).toEqual(
      'http://mock-endpoint.com/data?page=16'
    );
    expect(result.routes.nextPage).toEqual(null);
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

    const properties = {
      limit: 6,
      page: 5,
    };

    await sut.paginate(repository, properties);

    const expectedSkip = (properties.page - 1) * 6;

    expect(findAndCountSpy).toHaveBeenCalledWith({
      skip: expectedSkip,
      take: 6,
    });
  });

  it('Should resolve page to zero when a negative page is provided', async () => {
    const { repository, sut } = makeSut(100);

    const findAndCountSpy = jest.spyOn(repository, 'findAndCount');

    await sut.paginate(repository, {
      limit: 6,
      page: -1,
    });

    expect(findAndCountSpy).toHaveBeenCalledWith({
      skip: 0,
      take: 6,
    });
  });

  it('Should resolve page to zero when a zero page is provided', async () => {
    const { repository, sut } = makeSut(100);

    const findAndCountSpy = jest.spyOn(repository, 'findAndCount');

    await sut.paginate(repository, {
      limit: 6,
      page: 0,
    });

    expect(findAndCountSpy).toHaveBeenCalledWith({
      skip: 0,
      take: 6,
    });
  });

  it('Should not set nextPage and previousPage when route is not provided', async () => {
    const { repository, sut } = makeSut(100);

    const result = await sut.paginate(repository, {
      limit: 6,
      page: 5,
    });

    expect(result.data.length).toEqual(6);
    expect(result.dataCount).toEqual(6);
    expect(result.pageDataCount).toEqual(17);
    expect(result.totalData).toEqual(100);
    expect(result.routes.nextPage).toEqual(null);
    expect(result.routes.previousPage).toEqual(null);
  });

  it('Should resolve page to 1 when zero page is provided', async () => {
    const { repository, sut } = makeSut(100);

    const result = await sut.paginate(repository, {
      limit: 6,
      page: 0,
      route: 'http://mock-endpoint.com/data',
    });

    expect(result.data.length).toEqual(6);
    expect(result.dataCount).toEqual(6);
    expect(result.pageDataCount).toEqual(17);
    expect(result.totalData).toEqual(100);
    expect(result.routes.nextPage).toEqual(
      'http://mock-endpoint.com/data?page=2'
    );
    expect(result.routes.previousPage).toEqual(null);
  });

  it('Should resolve page to 1 when negative page is provided', async () => {
    const { repository, sut } = makeSut(100);

    const result = await sut.paginate(repository, {
      limit: 6,
      page: -1,
      route: 'http://mock-endpoint.com/data',
    });

    expect(result.data.length).toEqual(6);
    expect(result.dataCount).toEqual(6);
    expect(result.pageDataCount).toEqual(17);
    expect(result.totalData).toEqual(100);
    expect(result.routes.nextPage).toEqual(
      'http://mock-endpoint.com/data?page=2'
    );
    expect(result.routes.previousPage).toEqual(null);
  });
});
