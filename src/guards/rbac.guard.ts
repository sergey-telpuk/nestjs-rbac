import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../services/rbac.service';
import { IRole } from '../role/interfaces/role.interface';

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

        const permissions = this.reflector.get<string[]>('RBAcPermissions', context.getHandler());

        if (!permissions) {
            throw new ForbiddenException('Bad permission.');
        }

        try {
            return  this.rbacService.getRole(user.role).can(...permissions);
        } catch (e) {
            throw new ForbiddenException(e.message);
        }
    }
}
