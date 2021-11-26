import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../services/rbac.service';
import { IRole } from '../role/interfaces/role.interface';
import { ParamsFilter } from '../params-filter/params.filter';
import { ASYNC_RBAC_REQUEST_FILTER, RBAC_REQUEST_FILTER } from '../constans';
import {
    RBAcAnyAsyncPermissions,
    RBAcAnyPermissions,
    RBAcAsyncPermissions,
    RBAcPermissions
} from '../decorators/rbac.permissions.decorator';

@Injectable()
export class RBAcGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly rbacService: RbacService,
    ) {

    }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user: IRole = request.user;

        if (!user) {
            throw new ForbiddenException('Getting user was failed.');
        }

        {
            const permAsync = this.rbacAsync(context);
            if (permAsync.length > 0) {
                const filter = new ParamsFilter();
                filter.setParam(ASYNC_RBAC_REQUEST_FILTER, {...request});
                return (await this.rbacService.getRole(user.role, filter)).canAsync(...permAsync);
            }
        }

        {
            const perm = this.rbac(context);
            if (perm.length > 0) {
                const filter = new ParamsFilter();
                filter.setParam(RBAC_REQUEST_FILTER, {...request});
                return (await this.rbacService.getRole(user.role, filter)).can(...perm);
            }
        }

        {
            const permAny = this.rbacAny(context);
            if (permAny.length > 0) {
                const filter = new ParamsFilter();
                filter.setParam(RBAC_REQUEST_FILTER, {...request});
                return (await this.rbacService.getRole(user.role, filter)).any(...permAny);
            }
        }

        {
            const permAnyAsync = this.rbacAnyAsync(context);
            if (permAnyAsync.length > 0) {
                const filter = new ParamsFilter();
                filter.setParam(ASYNC_RBAC_REQUEST_FILTER, {...request});
                return await (await this.rbacService.getRole(user.role, filter)).anyAsync(...permAnyAsync);
            }
        }

        throw new ForbiddenException();
    }

    private rbacAsync(context: ExecutionContext): string[] {
        const permissions = this.reflector.get<string[]>(RBAcAsyncPermissions.name, context.getHandler())
            || this.reflector.get<string[]>(RBAcAsyncPermissions.name, context.getClass());

        if (permissions !== undefined) {
            return permissions;
        }

        return [];
    }

    private rbac(context: ExecutionContext): string[] {
        const permissions = this.reflector.get<string[]>(RBAcPermissions.name, context.getHandler())
            || this.reflector.get<string[]>(RBAcPermissions.name, context.getClass());

        if (permissions !== undefined) {
            return permissions;
        }

        return [];
    }

    private rbacAny(context: ExecutionContext): string[][] {
        const permissions = this.reflector.get<string[][]>(RBAcAnyPermissions.name, context.getHandler())
            || this.reflector.get<string[][]>(RBAcAnyPermissions.name, context.getClass());

        if (permissions !== undefined) {
            return permissions;
        }

        return [];
    }

    private rbacAnyAsync(context: ExecutionContext): string[][] {
        const permissions = this.reflector.get<string[][]>(RBAcAnyAsyncPermissions.name, context.getHandler())
            || this.reflector.get<string[][]>(RBAcAnyAsyncPermissions.name, context.getClass());

        if (permissions !== undefined) {
            return permissions;
        }

        return [];
    }
}
