## About

Nest-paginator allows you to paginate data with two instances from TypeORM:

- [Repository](https://github.com/typeorm/typeorm/blob/master/src/repository/Repository.ts)
- [SelectQueryBuilder](https://github.com/typeorm/typeorm/blob/master/src/query-builder/SelectQueryBuilder.ts)

SelectQueryBuilder has a regular pagination but also contains a attribute `isRawPagination` that allows users get raw results. You can find more about raw results at [TypeORM Documentation](https://orkhan.gitbook.io/typeorm/docs/select-query-builder#getting-raw-results)

## Examples

#### Using Repository to paginate data

```ts
import { BadRequestException } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { makePaginator } from 'nest-paginator';
import { PaginateQueryDto } from './dto/paginate-query.dto';

async fetchAllPaginated(paginateQuery: PaginateQueryDto) {
	try {
	const { limit = 10, page = 1 } = paginateQuery;
	const userPaginator = makePaginator<UserEntity>();
	const paginationResult = await userPaginator.paginate(this.usersRepository,
		{
			limit: limit,
			page: page
		},
	);
	return paginationResult;

	} catch (err) {
	if (err?.errors) {
		throw new BadRequestException(err?.errors);
	}
		throw err;
	}
}
```

#### Using Query Builder to paginate data

```ts
import { BadRequestException } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { makePaginator } from 'nest-paginator';
import { PaginateQueryDto } from './dto/paginate-query.dto';

async fetchAllPaginatedQueryBuilder(paginateQuery: PaginateQueryDto) {
	try {
	const { limit = 10, page = 1 } = paginateQuery;
	const userPaginator = makePaginator<UserEntity>();
	const queryBuilder = this.usersRepository.createQueryBuilder('u')
	const paginationResult = await userPaginator.paginate(queryBuilder,
		{
			limit: limit,
			page: page
		},
	);
	return paginationResult;

	} catch (err) {
	if (err?.errors) {
		throw new BadRequestException(err?.errors);
	}
		throw err;
	}
}
```

#### Using Query Builder to paginate data with raw results

- **isRawPagination** as true returns raw results

```ts
import { BadRequestException } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { makePaginator } from 'nest-paginator';
import { PaginateQueryDto } from './dto/paginate-query.dto';

async fetchAllPaginatedQueryBuilderRaw(paginateQuery: PaginateQueryDto) {
	try {
	const { limit = 10, page = 1 } = paginateQuery;
	const userPaginator = makePaginator<UserEntity>();
	const queryBuilder = this.usersRepository
		.createQueryBuilder('u')
		.select('u.state', 'state_name')
		.addSelect('COUNT(u.state)', 'users_state_count')
		.groupBy('u.state')
		.orderBy('u.state', 'DESC');

	const paginationResult = await userPaginator.paginate(queryBuilder,
		{
			limit: limit,
			page: page,
			isRawPagination: true
		},
	);
	return paginationResult;

	} catch (err) {
	if (err?.errors) {
		throw new BadRequestException(err?.errors);
	}
		throw err;
	}
}
```

## Query Options

- You can pass a query options when calling paginate, those options are the same of **FindManyOptions**, allowing you to query pagination entity as you want.

```ts
import { BadRequestException } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { makePaginator } from 'nest-paginator';
import { PaginateQueryDto } from './dto/paginate-query.dto';

async fetchAllPaginatedQueryBuilderRaw(paginateQuery: PaginateQueryDto) {
	try {
	const { limit = 10, page = 1 } = paginateQuery;
	const userPaginator = makePaginator<UserEntity>();
	const queryBuilder = this.usersRepository
		.createQueryBuilder('u')
		.select('u.state', 'state_name')
		.addSelect('COUNT(u.state)', 'users_state_count')
		.groupBy('u.state')
		.orderBy('u.state', 'DESC');

	const paginationResult = await userPaginator.paginate(queryBuilder,
		{
			limit: limit,
			page: page,
			isRawPagination: true,
			query: {
				where: {
					state: 'Ceará'
				},
			},
		},
	);
	return paginationResult;

	} catch (err) {
	if (err?.errors) {
		throw new BadRequestException(err?.errors);
	}
		throw err;
	}
}
```

### Example Response

```json
{
  "responseData": [
    {
      "address": "876 Betty Parkway",
      "created_at": "2024-07-24T16:40:42.276Z",
      "email": "Sally28@yahoo.com",
      "first_name": "Holly",
      "last_name": "Corkery",
      "state": "Maine",
      "user_id": 21,
      "zip_code": "52883-9333"
    },
    {
      "address": "12485 N Water Street",
      "created_at": "2024-07-24T16:40:42.283Z",
      "email": "Darryl_Veum@yahoo.com",
      "first_name": "Adrain",
      "last_name": "Kerluke",
      "state": "Minnesota",
      "user_id": 22,
      "zip_code": "35199"
    },
    {
      "address": "634 Marlborough Road",
      "created_at": "2024-07-24T16:40:42.293Z",
      "email": "Graham.Schultz52@yahoo.com",
      "first_name": "Madilyn",
      "last_name": "Smith",
      "state": "Oklahoma",
      "user_id": 23,
      "zip_code": "95940"
    },
    {
      "address": "8910 Priory Close",
      "created_at": "2024-07-24T16:40:42.304Z",
      "email": "Shyann_Torp39@gmail.com",
      "first_name": "Hillard",
      "last_name": "Schimmel",
      "state": "New York",
      "user_id": 24,
      "zip_code": "03280"
    },
    {
      "address": "2323 Schaden Skyway",
      "created_at": "2024-07-24T16:40:42.320Z",
      "email": "Gardner.Wintheiser@yahoo.com",
      "first_name": "Junior",
      "last_name": "DuBuque",
      "state": "Illinois",
      "user_id": 25,
      "zip_code": "18719"
    },
    {
      "address": "741 Jadon Plain",
      "created_at": "2024-07-24T16:40:42.329Z",
      "email": "Cale_Kuhlman@gmail.com",
      "first_name": "Blaze",
      "last_name": "Swift",
      "state": "Wyoming",
      "user_id": 26,
      "zip_code": "22645"
    },
    {
      "address": "785 Sanford Crossroad",
      "created_at": "2024-07-24T16:40:42.342Z",
      "email": "Elton95@yahoo.com",
      "first_name": "Audie",
      "last_name": "Cummings",
      "state": "New Mexico",
      "user_id": 27,
      "zip_code": "95246-0830"
    },
    {
      "address": "189 12th Street",
      "created_at": "2024-07-24T16:40:42.363Z",
      "email": "Augustine31@yahoo.com",
      "first_name": "Moses",
      "last_name": "Willms",
      "state": "Colorado",
      "user_id": 28,
      "zip_code": "66530-9591"
    },
    {
      "address": "553 Damian River",
      "created_at": "2024-07-24T16:40:42.375Z",
      "email": "Thurman_Monahan@yahoo.com",
      "first_name": "Francis",
      "last_name": "Maggio",
      "state": "Montana",
      "user_id": 29,
      "zip_code": "05160"
    },
    {
      "address": "8817 Back Lane",
      "created_at": "2024-07-24T16:40:42.384Z",
      "email": "Orlando.Dickinson@gmail.com",
      "first_name": "Paolo",
      "last_name": "Fisher",
      "state": "New Jersey",
      "user_id": 30,
      "zip_code": "09505-9191"
    }
  ],
  "responseInformation": {
    "limitRows": 10,
    "pages": {
      "currentPage": 3,
      "lastPage": 10,
      "nextPage": 4,
      "previousPage": 2
    },
    "totalRows": 100
  }
}
```

## Example Response - Raw Results

- In this example raw result returns the number of users for each state, so paginating with raw results allows you to use aggregation functions and other type of queries that regular pagination doesn't permit. [TypeORM Documentation](https://orkhan.gitbook.io/typeorm/docs/select-query-builder#getting-raw-results) details this.

```ts
{
	"responseData": [
		{
			"state_name": "Wyoming",
			"users_state_count": "1"
		},
		{
			"state_name": "Wisconsin",
			"users_state_count": "1"
		},
		{
			"state_name": "West Virginia",
			"users_state_count": "1"
		},
		{
			"state_name": "Washington",
			"users_state_count": "4"
		},
		{
			"state_name": "Vermont",
			"users_state_count": "3"
		},
		{
			"state_name": "Utah",
			"users_state_count": "3"
		},
		{
			"state_name": "Tennessee",
			"users_state_count": "2"
		},
		{
			"state_name": "South Dakota",
			"users_state_count": "2"
		},
		{
			"state_name": "South Carolina",
			"users_state_count": "1"
		},
		{
			"state_name": "Pennsylvania",
			"users_state_count": "2"
		}
	],
	"responseInformation": {
		"limitRows": 10,
		"pages": {
			"currentPage": 1,
			"lastPage": 5,
			"nextPage": 2,
			"previousPage": null
		},
		"totalRows": 43
	}
}
```
