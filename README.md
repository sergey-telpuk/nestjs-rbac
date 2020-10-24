[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/sergey-telpuk/nestjs-rbac/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/sergey-telpuk/nestjs-rbac/)
[![codecov](https://codecov.io/gh/sergey-telpuk/nestjs-rbac/branch/master/graph/badge.svg)](https://codecov.io/gh/sergey-telpuk/nestjs-rbac)
[![npm](https://img.shields.io/npm/dw/nestjs-rbac)](https://www.npmjs.com/package/nestjs-rbac)
![RBAC CI](https://github.com/sergey-telpuk/nestjs-rbac/workflows/RBAC%20CI/badge.svg)
![RBAC CD](https://github.com/sergey-telpuk/nestjs-rbac/workflows/RBAC%20CD/badge.svg)
## Description
The **rbac** module for [Nest](https://github.com/nestjs/nest).

## Installation
npm i --save nestjs-rbac

## Quick Start
For using `RBAC` there is need to implement `IStorageRbac`
```typescript
export interface IStorageRbac {
  roles: string[];
  permissions: object;
  grants: object;
  filters: { [key: string]: any | IFilterPermission };
}
```
### For instance:
```typescript
export const RBACstorage: IStorageRbac = {
  roles: ['admin', 'user'],
  permissions: {
    permission1: ['create', 'update', 'delete'],
    permission2: ['create', 'update', 'delete'],
    permission3: ['filter1', 'filter2', RBAC_REQUEST_FILTER],
    permission4: ['create', 'update', 'delete'],
  },
  grants: {
    admin: [
      '&user',
      'permission1',
      'permission3',
    ],
    user: ['permission2', 'permission1@create', 'permission3@filter1'],
  },
  filters: {
    filter1: TestFilterOne,
    filter2: TestFilterTwo,
    [RBAC_REQUEST_FILTER]: RequestFilter,
  },
};
```

### Storage consists of the following keys:

`roles`: array of roles

`permissions`: objects of permissions which content actions

`grants`: objects of assigned permission to roles

`filters`:  objects of customized behavior
### Grant symbols
`&`: extends grant by another grant, for instance `admin` extends `user` _(only support one level inheritance)_

`@`: a particular action from permission, for instance `permission1@update`
### Using RBAC like an unchangeable storage
```typescript
import { Module } from '@nestjs/common';
import { RBAcModule } from 'nestjs-rbac';

@Module({
  imports: [
    RBAcModule.forRoot(IStorageRbac),
  ],
  controllers: []
})
export class AppModule {}
```
### Using RBAC like a dynamic storage
_There is enough to implement IDynamicStorageRbac interface._
```typescript
import { Module } from '@nestjs/common';
import { RBAcModule } from 'nestjs-rbac';

@Module({
  imports: [
    RBAcModule.forDynamic(DynamicStorageService),
  ],
  controllers: []
})
export class AppModule {}
// implement dynamic storage
import { IDynamicStorageRbac, IStorageRbac } from 'nestjs-rbac';
@Injectable()
export class  DynamicStorageService implements IDynamicStorageRbac {
  constructor(
    private readonly repository: AnyRepository
  ) {

  }
  async getRbac(): Promise<IStorageRbac> {
//use any persistence storage for getting `RBAC`
      return  await this.repository.getRbac();
  }
}
```
#### Using for routers
```typescript
import { RBAcPermissions, RBAcGuard } from 'nestjs-rbac';

@Controller()
export class RbacTestController {

  @RBAcPermissions('permission', 'permission@create')
  @UseGuards(
// Any Guard for getting & adding user to request which implements `IRole` interface from `nestjs-rbac`:
//*NOTE:
//  const request = context.switchToHttp().getRequest();
//  const user: IRole = request.user;
    GuardIsForAddingUserToRequestGuard,
    RBAcGuard,
  )
  @Get('/')
  async test1(): Promise<boolean> {
    return true;
  }
}
```
#### Using for a whole controller
It's applicable with the crud library, for example [nestjsx/crud](https://github.com/nestjsx/crud)
```typescript
import { RBAcPermissions, RBAcGuard } from 'nestjs-rbac';

@Crud({
	model: {
		type: Company,
	},
})
@RBAcPermissions('permission2')
@UseGuards(
		AuthGuard,
		RBAcGuard,
)
@Controller('companies')
export class CompaniesController implements CrudController<Company> {
	constructor(public service: CompaniesService) {}
}
```
### one more example
```typescript
@Crud({
	model: {
		type: Company,
	},
	routes: {
		getManyBase: {
			interceptors : [],
			decorators: [RBAcPermissions('permission1')],
		},
		createOneBase: {
			interceptors : [],
			decorators: [RBAcPermissions('permission2')],
		},
	},
})
@UseGuards(
		AuthGuard,
		RBAcGuard,
)
@Controller('companies')
export class CompaniesController implements CrudController<Company> {
	constructor(public service: CompaniesService) {
	}
}
```
#### Using like service
```typescript
import { RbacService } from 'nestjs-rbac';

@Controller()
export class RbacTestController {

  constructor(
    private readonly rbac: RbacService
  ){}

  @Get('/')
  async test1(): Promise<boolean> {
    return await (await this.rbac.getRole(role)).can('permission', 'permission@create');
    return true;
  }
}
```
#### Using the custom filters
`filter` is a great opportunity of customising behaviour RBAC.
For creating `filter`, there is need to implement `IFilterPermission` interface, which requires for implementing `can` method, and bind a key filter with filter implementation, like below:
```typescript
export const RBAC: IStorageRbac = {
  roles: ['role'],
  permissions: {
    permission1: ['filter1', 'filter2'],
  },
  grants: {
    role: [
      `permission1@filter1`
      `permission1@filter2`
    ],
  },
  filters: {
    filter1: TestFilter,
    filter2: TestAsyncFilter,
  },
};
//===================== implementing filter
import { IFilterPermission } from 'nestjs-rbac';

export class TestFilter implements IFilterPermission {

  can(params?: any[]): boolean {
    return params[0];
  }

}

//===================== implementing async filter
import { IFilterPermission } from 'nestjs-rbac';

@Injectable()
export class TestAsyncFilter implements IFilterPermission {
  constructor(private readonly myService: MyService) {}

  async canAsync(params?: any[]): Promise<boolean> {
    const myResult = await this.myService.someAsyncOperation()
    // Do something with myResult
    return myResult;
  }
}
```
:warning: - A single filter can implement both `can` and `canAsync`. If you use the RBAcGuard, they will be evaluated with an **AND** condition.

`ParamsFilter` services for passing arguments into particular filter:
```typescript
const filter = new ParamsFilter();
filter.setParam('filter1', some payload);

const res = await (await rbacService.getRole('admin', filter)).can(
  'permission1@filter1',
);
```
Also RBAC has a default filter `RBAC_REQUEST_FILTER` which has `request` object as argument:
##### Example:
```typescript
//===================== filter
export class RequestFilter implements IFilterPermission {

  can(params?: any[]): boolean {
    return params[0].headers['test-header'] === 'test';
  }
}
//===================== storage
export const RBAC: IStorageRbac = {
  roles: ['role'],
  permissions: {
    permission1: ['filter1', 'filter2', RBAC_REQUEST_FILTER],
  },
  grants: {
    role: [
      `permission1@${RBAC_REQUEST_FILTER}`
    ],
  },
  filters: {
    [RBAC_REQUEST_FILTER]: RequestFilter,
  },
};
//===================== using for routes
  @RBAcPermissions(`permission1@${RBAC_REQUEST_FILTER}`)
  @UseGuards(
    AuthGuard,
    RBAcGuard,
  )
  @Get('/')
  async test4(): Promise<boolean> {
    return true;
  }
```
### Performance
By default, RBAC storage always parses grants for each request, in some cases, it can be a very expensive operation.
The bigger RBAC storage, the more taking time for parsing. For saving performance RBAC has built-in a cache, based on [node-cache](https://github.com/node-cache/node-cache)
#### Using cache
```typescript
import { RbacCache } from 'nestjs-rbac';

@Module({
  imports: [
    RBAcModule.useCache(RbacCache, {KEY: 'RBAC', TTL: 400}).forDynamic(AsyncService),
  ],
})
```
if you need to change a cache storage, there is enough to implement  `ICacheRBAC`
#### ICacheRBAC
```typescript
export interface ICacheRBAC {
  KEY: string;
  TTL: number;

  get(): object | null;

  /**
   *
   * @param value
   */
  set(value: object): void;

  del(): void;
}
```
#### Inject `ICacheRBAC`
```typescript
import { ICacheRBAC } from 'nestjs-rbac';
...
@Inject('ICacheRBAC') cache: ICacheRBAC
```



