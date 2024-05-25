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
    expect(result.previousPage).toEqual('http://mock-endpoint.com/data?page=4');
    expect(result.nextPage).toEqual('http://mock-endpoint.com/data?page=6');
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
    expect(result.previousPage).toEqual('http://mock-endpoint.com/data?page=1');
    expect(result.nextPage).toEqual(`http://mock-endpoint.com/data?page=2`);
  });

  it('Should not set nextPage when it reaches data set limit', async () => {
    const { repository, sut } = makeSut(100);

    const result = await sut.paginate(repository, {
      limit: 6,
      page: 19,
      route: 'http://mock-endpoint.com/data',
    });

    expect(result.data.length).toEqual(6);
    expect(result.dataCount).toEqual(6);
    expect(result.pageDataCount).toEqual(17);
    expect(result.totalData).toEqual(100);
    expect(result.previousPage).toEqual(
      'http://mock-endpoint.com/data?page=18'
    );
    expect(result.nextPage).toEqual(`http://mock-endpoint.com/data?page=19`);
  });
});
