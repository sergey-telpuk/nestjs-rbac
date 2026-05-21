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
import { IRoleRbac } from '../role/interfaces/role.rbac.interface';

@Injectable()
export class RBAcGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly rbacService: RbacService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user: IRole | undefined = request?.user;

        if (!user || typeof user.role !== 'string') {
            throw new ForbiddenException('Getting user was failed.');
        }

        const permAsync = this.readMetadata<string[]>(context, RBAcAsyncPermissions.name);
        const perm = this.readMetadata<string[]>(context, RBAcPermissions.name);
        const permAny = this.readMetadata<string[][]>(context, RBAcAnyPermissions.name);
        const permAnyAsync = this.readMetadata<string[][]>(context, RBAcAnyAsyncPermissions.name);

        const active: string[] = [];
        if (permAsync.length > 0) active.push(RBAcAsyncPermissions.name);
        if (perm.length > 0) active.push(RBAcPermissions.name);
        if (permAny.length > 0) active.push(RBAcAnyPermissions.name);
        if (permAnyAsync.length > 0) active.push(RBAcAnyAsyncPermissions.name);

        if (active.length > 1) {
            throw new ForbiddenException(
                `Multiple RBAC decorators on the same handler are not allowed: ${active.join(', ')}`,
            );
        }

        if (permAsync.length > 0) {
            const role = await this.resolveRole(user.role, request, ASYNC_RBAC_REQUEST_FILTER);
            return role.canAsync(...permAsync);
        }

        if (perm.length > 0) {
            const role = await this.resolveRole(user.role, request, RBAC_REQUEST_FILTER);
            return role.can(...perm);
        }

        if (permAny.length > 0) {
            const role = await this.resolveRole(user.role, request, RBAC_REQUEST_FILTER);
            return role.any(...permAny);
        }

        if (permAnyAsync.length > 0) {
            const role = await this.resolveRole(user.role, request, ASYNC_RBAC_REQUEST_FILTER);
            return role.anyAsync(...permAnyAsync);
        }

        throw new ForbiddenException();
    }

    private async resolveRole(role: string, request: unknown, filterKey: string): Promise<IRoleRbac> {
        const filter = new ParamsFilter();
        filter.setParam(filterKey, { ...(request as object) });
        return this.rbacService.getRole(role, filter);
    }

    private readMetadata<T>(context: ExecutionContext, key: string): T extends unknown[] ? T : never {
        const value =
            this.reflector.get<T>(key, context.getHandler()) ||
            this.reflector.get<T>(key, context.getClass());

        return (value ?? []) as T extends unknown[] ? T : never;
    }
}
