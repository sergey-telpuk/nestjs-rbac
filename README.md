[![npm version](https://badge.fury.io/js/nestjs-rbac.svg?icon=si%3Anpm)](https://badge.fury.io/js/nestjs-rbac)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/sergey-telpuk/nestjs-rbac/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/sergey-telpuk/nestjs-rbac/)
[![codecov](https://codecov.io/gh/sergey-telpuk/nestjs-rbac/branch/master/graph/badge.svg)](https://codecov.io/gh/sergey-telpuk/nestjs-rbac)
[![npm](https://img.shields.io/npm/dw/nestjs-rbac)](https://www.npmjs.com/package/nestjs-rbac)
![RBAC CI](https://github.com/sergey-telpuk/nestjs-rbac/workflows/RBAC%20CI/badge.svg)
![RBAC CD](https://github.com/sergey-telpuk/nestjs-rbac/workflows/RBAC%20CD/badge.svg)

# nestjs-rbac
RBAC module for [Nest](https://github.com/nestjs/nest) applications.

## Community
Join our Discord server: [Link](https://discord.gg/Gu3KxPJNg3)

## Compatibility
Supports NestJS ^8.0.0 || ^9.0.0 || ^10.0.0 || ^11.0.0.

## Installation
```bash
npm i nestjs-rbac
```

## Core concepts
RBAC storage consists of the following keys:

- `roles`: list of role names
- `permissions`: map of permission name to allowed actions
- `grants`: map of role name to permission grants
- `filters`: map of filter key to filter implementation (class or instance)

Prefix `ASYNC_` use for async operations.

### Grant syntax
- `&` extends another grant, for instance `admin` extends `user` (only one level of inheritance)
- `@` selects a single action, for instance `permission1@update`

### Behavior notes
- Grants are expanded to include `permission@action` for each action in `permissions`.
- Missing permissions in `permissions` are ignored during grant parsing.
- When multiple permissions are passed to `can` or `canAsync`, all must pass (AND).
- `ParamsFilter.setParam` stores arguments as an array; filters receive the same array.

## Quick start
Define your RBAC storage:
```typescript
import { Type } from '@nestjs/common';
import { IFilterPermission, IStorageRbac } from 'nestjs-rbac';

export const RBAC: IStorageRbac = {
  roles: ['admin', 'user'],
  permissions: {
    permission1: ['create', 'update', 'delete'],
    permission2: ['create', 'update', 'delete'],
    permission3: ['filter1', 'filter2', RBAC_REQUEST_FILTER],
    permission4: ['create', 'update', 'delete'],
    permission5: ['ASYNC_filter1', 'ASYNC_filter2', ASYNC_RBAC_REQUEST_FILTER],
  },
  grants: {
    admin: ['&user', 'permission1', 'permission3', 'permission5'],
    user: [
      '&userRoot',
      'permission2',
      'permission1@create',
      'permission3@filter1',
      'permission5@ASYNC_filter1',
    ],
    userRoot: ['permission4'],
  },
  filters: {
    filter1: TestFilterOne,
    filter2: TestFilterTwo,
    ASYNC_filter1: TestAsyncFilterOne,
    ASYNC_filter2: TestAsyncFilterTwo,
    [RBAC_REQUEST_FILTER]: RequestFilter,
    [ASYNC_RBAC_REQUEST_FILTER]: RequestAsyncFilter,
  },
};
```

Register the module:
```typescript
import { Module } from '@nestjs/common';
import { RBAcModule } from 'nestjs-rbac';

@Module({
  imports: [RBAcModule.forRoot(RBAC)],
  controllers: [],
})
export class AppModule {}
```

Protect routes with the guard and decorators:
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RBAcGuard, RBAcPermissions } from 'nestjs-rbac';

@Controller()
export class RbacTestController {
  @RBAcPermissions('permission1', 'permission1@create')
  @UseGuards(AuthGuard, RBAcGuard)
  @Get('/example')
  async example(): Promise<boolean> {
    return true;
  }
}
```

> Note: The guard expects `request.user` to implement `IRole` (`{ role: string }`).

## Static vs dynamic storage
### Static storage
```typescript
import { Module } from '@nestjs/common';
import { RBAcModule } from 'nestjs-rbac';

@Module({
  imports: [RBAcModule.forRoot(RBAC)],
})
export class AppModule {}
```

### Dynamic storage
Implement `IDynamicStorageRbac` to load RBAC rules from a database, service, or file:
```typescript
import { Injectable, Module } from '@nestjs/common';
import { IDynamicStorageRbac, IStorageRbac, RBAcModule } from 'nestjs-rbac';

@Injectable()
export class DynamicStorageService implements IDynamicStorageRbac {
  constructor(private readonly repository: AnyRepository) {}

  async getRbac(): Promise<IStorageRbac> {
    return this.repository.getRbac();
  }
}

@Module({
  imports: [RBAcModule.forDynamic(DynamicStorageService)],
})
export class AppModule {}
```

## Decorators
- `@RBAcPermissions('permission', 'permission@create')` (AND)
- `@RBAcAnyPermissions(['permission'], ['permission@create'])` (OR)
- `@RBAcAsyncPermissions('permission', 'permission@create')` (AND, async filters)
- `@RBAcAnyAsyncPermissions(['permission'], ['permission@create'])` (OR, async filters)

### Controller-wide guard example (CRUD)
```typescript
import { RBAcPermissions, RBAcGuard } from 'nestjs-rbac';

@Crud({ model: { type: Company } })
@RBAcPermissions('permission2')
@UseGuards(AuthGuard, RBAcGuard)
@Controller('companies')
export class CompaniesController implements CrudController<Company> {
  constructor(public service: CompaniesService) {}
}
```

## Using as a service
```typescript
import { Controller, Get } from '@nestjs/common';
import { RbacService } from 'nestjs-rbac';

@Controller()
export class RbacTestController {
  constructor(private readonly rbac: RbacService) {}

  @Get('/')
  async test(): Promise<boolean> {
    return (await this.rbac.getRole(role)).can('permission', 'permission@create');
  }
}
```

## Custom filters
Filters allow custom runtime checks. Implement `IFilterPermission` and bind the filter key in storage.
```typescript
import { IFilterPermission } from 'nestjs-rbac';

export class TestFilter implements IFilterPermission {
  can(params?: unknown[]): boolean {
    return Boolean(params?.[0]);
  }
}

@Injectable()
export class TestAsyncFilter implements IFilterPermission {
  constructor(private readonly myService: MyService) {}

  async canAsync(params?: unknown[]): Promise<boolean> {
    const myResult = await this.myService.someAsyncOperation();
    return Boolean(myResult);
  }
}
```

A single filter can implement both `can` and `canAsync`. If you use the `RBAcGuard`, they are evaluated with an AND condition.

### ParamsFilter
```typescript
const filter = new ParamsFilter();
filter.setParam('filter1', somePayload);

const res = (await rbacService.getRole('admin', filter)).can('permission1@filter1');
```

### Request filter example
`RBAC_REQUEST_FILTER` passes the request object into the filter:
```typescript
import { IFilterPermission, RBAC_REQUEST_FILTER } from 'nestjs-rbac';

export class RequestFilter implements IFilterPermission {
  can(params?: unknown[]): boolean {
    const request = params?.[0] as { headers?: Record<string, string> } | undefined;
    return request?.headers?.['test-header'] === 'test';
  }
}

export const RBAC: IStorageRbac = {
  roles: ['role'],
  permissions: {
    permission1: ['filter1', 'filter2', RBAC_REQUEST_FILTER],
  },
  grants: {
    role: [`permission1@${RBAC_REQUEST_FILTER}`],
  },
  filters: {
    [RBAC_REQUEST_FILTER]: RequestFilter,
  },
};
```

## Cache
Large RBAC storages can make grant parsing expensive. You can enable cache with the built-in `RbacCache` (node-cache):
```typescript
import { RBAcModule, RbacCache } from 'nestjs-rbac';

@Module({
  imports: [
    RBAcModule.useCache(RbacCache, { KEY: 'RBAC', TTL: 400 }).forDynamic(AsyncService),
  ],
})
export class AppModule {}
```

To use a custom cache, implement `ICacheRBAC` and inject it via `@Inject('ICacheRBAC')`.

## Testing
```bash
npm test
npm run test:int
npm run test:e2e
```

## Linting
```bash
npm run lint
npm run lint:fix
```

## Docker
```bash
docker-compose up --build
```
