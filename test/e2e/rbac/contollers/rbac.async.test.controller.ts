import { Controller, Get, UseGuards } from '@nestjs/common';
import { RBAcGuard } from '../../../../src/guards/rbac.guard';
import {RBAcAnyPermissions, RBAcAsyncPermissions, RBAcAnyAsyncPermissions} from '../../../../src/decorators/rbac.permissions.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { ASYNC_RBAC_REQUEST_FILTER } from '../../../../src/constans';

@Controller()
export class RbacAsyncTestController {

  @RBAcAsyncPermissions('permission1')
  @UseGuards(
    AuthGuard,
    RBAcGuard,
  )
  @Get('/admin-permission1')
  async test1(): Promise<boolean> {
    return true;
  }

  @RBAcAsyncPermissions('permission2', 'permission1')
  @UseGuards(
    AuthGuard,
    RBAcGuard,
  )
  @Get('/admin-permission1-and-permission2')
  async test2(): Promise<boolean> {
    return true;
  }

  @RBAcAsyncPermissions('permission4')
  @UseGuards(
    AuthGuard,
    RBAcGuard,
  )
  @Get('/admin-permission4')
  async test3(): Promise<boolean> {
    return true;
  }

  @RBAcAsyncPermissions(`permission5@${ASYNC_RBAC_REQUEST_FILTER}`)
  @UseGuards(
    AuthGuard,
    RBAcGuard,
  )
  @Get('/admin-request-filter')
  async test4(): Promise<boolean> {
    return true;
  }

  @RBAcAsyncPermissions(`permission4`)
  @UseGuards(
    AuthGuard,
    RBAcGuard,
  )
  @Get('/user-extends-userRoot')
  async test5(): Promise<boolean> {
    return true;
  }

  @RBAcAsyncPermissions(`permission1@create`)
  @UseGuards(
    AuthGuard,
    RBAcGuard,
  )
  @Get('/user-permission1@create')
  async test7(): Promise<boolean> {
    return true;
  }

  @RBAcAsyncPermissions(`permission1@delete`)
  @UseGuards(
    AuthGuard,
    RBAcGuard,
  )
  @Get('/user-permission1@delete')
  async test8(): Promise<boolean> {
    return true;
  }

  @RBAcAnyAsyncPermissions(
      [`permission1@delete`],
      [`permission1@create`]
  )
  @UseGuards(
      AuthGuard,
      RBAcGuard,
  )
  @Get('/user-permission1@deleteOrCreate')
  async test9(): Promise<boolean> {
    return true;
  }
}
