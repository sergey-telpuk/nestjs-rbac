import { Controller, Get, UseGuards } from '@nestjs/common';
import { RBAcGuard } from '../../../../src/guards/rbac.guard';
import { RBAcPermissions } from '../../../../src/decorators/rbac.permissions.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { RBAC_REQUEST_FILTER } from '../../../../src/constans';

@Controller()
export class RbacTestController {

    @RBAcPermissions('permission1')
    @UseGuards(
        AuthGuard,
        RBAcGuard,
    )
    @Get('/admin-permission1')
    async test1(): Promise<boolean> {
        return true;
    }

    @RBAcPermissions('permission2', 'permission1')
    @UseGuards(
        AuthGuard,
        RBAcGuard,
    )
    @Get('/admin-permission1-and-permission2')
    async test2(): Promise<boolean> {
        return true;
    }

    @RBAcPermissions('permission4')
    @UseGuards(
        AuthGuard,
        RBAcGuard,
    )
    @Get('/admin-permission4')
    async test3(): Promise<boolean> {
        return true;
    }

    @RBAcPermissions(`permission3@${RBAC_REQUEST_FILTER}`)
    @UseGuards(
      AuthGuard,
      RBAcGuard,
    )
    @Get('/admin-request-filter')
    async test4(): Promise<boolean> {
        return true;
    }

}
