[![Build Status](https://travis-ci.org/sergey-telpuk/nestjs-rbac.svg?branch=master)](https://travis-ci.org/sergey-telpuk/nestjs-rbac)
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
For instance: 

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
    user: ['&userRoot', 'permission2', 'permission1@create', 'permission3@filter1'],
    userRoot: ['permission4'],

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

`permissions`: objects of permissions witch content actions

`grants`: objects of assigned permission to roles

`filters`:  objects of customs roles

### Using
```typescript
import { Module } from '@nestjs/common';
import { I18nModule } from 'nestjs-rbac';

@Module({
  imports: [
    RBAcModule.forRoot(RBACstorage),
  ],
  controllers: []
})
export class AppModule {}
```
### Using for routers
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
### Using like service
```typescript
import { RbacService} from 'nestjs-rbac';

@Controller()
export class RbacTestController {

  constructor(
    private readonly rbac: RbacService
  ){}
    
  @Get('/')
  async test1(): Promise<boolean> {
    this.rbac.getRole(role).can('permission', 'permission@create');
    return true;
  }
}
```