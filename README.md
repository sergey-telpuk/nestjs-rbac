[![Build Status](https://travis-ci.org/sergey-telpuk/nestjs-rbac.svg?branch=master)](https://travis-ci.org/sergey-telpuk/nestjs-rbac) 
[![Greenkeeper badge](https://badges.greenkeeper.io/sergey-telpuk/nestjs-rbac.svg)](https://greenkeeper.io/)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/sergey-telpuk/nestjs-rbac/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/sergey-telpuk/nestjs-rbac/)
[![codecov](https://codecov.io/gh/sergey-telpuk/nestjs-rbac/branch/master/graph/badge.svg)](https://codecov.io/gh/sergey-telpuk/nestjs-rbac)
## Description
The **rbac** module for [Nest](https://github.com/nestjs/nest).

## Installation
npm i --save nestjs-rbac

## Quick Start
For using RBAC there is need to implement `IStorageRbac` 
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

`filters`:  objects of customs roles
### Grant symbols 
`&`: extends grant by another grant, for instance `admin` extends `user` _(only support one level inheritance)_

`@`: a particular action from permission, for instance `permission1@update`
### Using RBAC like an unchangeable storage 
```typescript
import { Module } from '@nestjs/common';
import { RBAcModule } from 'nestjs-rbac';

@Module({
  imports: [
    RBAcModule.forRoot(RBACstorage),
  ],
  controllers: []
})
export class AppModule {}
```
### Using RBAC like a dynamic storage
```typescript
import { Module } from '@nestjs/common';
import { RBAcModule } from 'nestjs-rbac';

@Module({
  imports: [
    RBAcModule.forDynamic(AsyncService),
  ],
  controllers: []
})
export class AppModule {}
// implement dynamic storage
import { IDynamicStorageRbac, IStorageRbac } from 'nestjs-rbac';
@Injectable()
export class AsyncService implements IDynamicStorageRbac{
  async getRbac(): Promise<IStorageRbac> {
    return new Promise((resolve) => {
      // resolve(RBAC)
        setTimeout(() => {
            resolve(RBAC);
        },1000);
    });
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
    AuthGuard, // need for using user into the request
    RBAcGuard,
  )
  @Get('/')
  async test1(): Promise<boolean> {
    return true;
  }
}
```
#### Using like service
```typescript
import { RbacService} from 'nestjs-rbac';

@Controller()
export class RbacTestController {

  constructor(
    private readonly rbac: RbacService
  ){}
    
  @Get('/')
  async test1(): Promise<boolean> {
    await this.rbac.getRole(role).can('permission', 'permission@create');
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
    permission1: ['filter1'],
  },
  grants: {
    role: [
      `permission1@filter1`
    ],
  },
  filters: {
    filter1: TestFilter,
  },
};  
//===================== implementing filter
import { IFilterPermission} from 'nestjs-rbac';

export class TestFilter implements IFilterPermission {

  can(params?: any[]): boolean {
    return params[0];
  }

}
```
`ParamsFilter` services for passing arguments into particular filter:
```typescript
const filter = new ParamsFilter();
filter.setParam('filter1', some payload);

const res = await rbacService.getRole('admin', filter).can(
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


