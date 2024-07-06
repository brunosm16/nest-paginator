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

    const {
      next,
      previous,
      result,
      resultLength,
      totalDataLength,
      totalPages,
    } = await sut.paginate(repository, {
      limit: 6,
      page: 1,
    });

    expect(next).toEqual(2);
    expect(previous).toEqual(null);
    expect(resultLength).toEqual(6);
    expect(totalDataLength).toEqual(100);
    expect(totalPages).toEqual(17);
    expect(result).toEqual(expect.any(Array<MockEntity>));
  });

  it('Should paginate to random page', async () => {
    const { repository, sut } = makeSut(100);

    const {
      next,
      previous,
      result,
      resultLength,
      totalDataLength,
      totalPages,
    } = await sut.paginate(repository, {
      limit: 6,
      page: 4,
    });

    expect(next).toEqual(5);
    expect(previous).toEqual(3);
    expect(resultLength).toEqual(6);
    expect(totalDataLength).toEqual(100);
    expect(totalPages).toEqual(17);
    expect(result).toEqual(expect.any(Array<MockEntity>));
  });

  it('Should paginate to last page', async () => {
    const { repository, sut } = makeSut(100);

    const {
      next,
      previous,
      result,
      resultLength,
      totalDataLength,
      totalPages,
    } = await sut.paginate(repository, {
      limit: 6,
      page: 17,
    });

    expect(next).toEqual(null);
    expect(previous).toEqual(16);
    expect(resultLength).toEqual(6);
    expect(totalDataLength).toEqual(100);
    expect(totalPages).toEqual(17);
    expect(result).toEqual(expect.any(Array<MockEntity>));
  });

  it('Should not return previous for first page', async () => {
    const { repository, sut } = makeSut(100);

    const data = await sut.paginate(repository, {
      limit: 6,
      page: 1,
    });

    expect(data.previous).toEqual(null);
    expect(data.next).toEqual(2);
  });

  it('Should not return next when it reaches data set limit', async () => {
    const { repository, sut } = makeSut(100);

    const data = await sut.paginate(repository, {
      limit: 6,
      page: 17,
    });

    expect(data.next).toEqual(null);
    expect(data.previous).toEqual(16);
  });

  it('Should catch error when paginating data', async () => {
    const { repository, sut } = makeSut(100);

    jest.spyOn(repository, 'findAndCount').mockImplementationOnce(() => {
      throw new Error('Mock Error');
    });

    const data = sut.paginate(repository, { limit: 1, page: 5 });

    await expect(data).rejects.toThrow('Mock Error');
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

  it('Should resolve page to 1 when zero page is provided', async () => {
    const { repository, sut } = makeSut(100);

    const { next, previous, result, resultLength } = await sut.paginate(
      repository,
      {
        limit: 6,
        page: 0,
      }
    );

    expect(next).toEqual(2);
    expect(previous).toEqual(null);
    expect(result).toEqual(expect.any(Array<MockEntity>));
    expect(resultLength).toEqual(6);
  });

  it('Should resolve page to 1 when negative page is provided', async () => {
    const { repository, sut } = makeSut(100);

    const { next, previous, result, resultLength } = await sut.paginate(
      repository,
      {
        limit: 6,
        page: -1,
      }
    );

    expect(next).toEqual(2);
    expect(previous).toEqual(null);
    expect(result).toEqual(expect.any(Array<MockEntity>));
    expect(resultLength).toEqual(6);
  });

  it("Should resolve pages when it's beyond the last page", async () => {
    const { repository, sut } = makeSut(100);

    const { next, previous, result, resultLength } = await sut.paginate(
      repository,
      {
        limit: 6,
        page: 50,
      }
    );

    expect(next).toEqual(null);
    expect(previous).toEqual(null);
    expect(result).toEqual(expect.any(Array<MockEntity>));
    expect(resultLength).toEqual(6);
  });
});
