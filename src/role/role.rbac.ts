import { Injectable } from '@nestjs/common';
import { IRoleRbac } from './interfaces/role.rbac.interface';
import { IFilterPermission } from '../permissions/interfaces/filter.permission.interface';
import { IParamsFilter } from '../params-filter/interfaces/params.filter.interface';

@Injectable()
export class RoleRbac implements IRoleRbac {
    private readonly grantSet: Set<string>;
    private readonly filterKeys: string[];

    constructor(
        private readonly role: string,
        grant: string[],
        private readonly filters: Record<string, IFilterPermission>,
        private readonly paramsFilter?: IParamsFilter,
    ) {
        this.grantSet = new Set(grant);
        this.filterKeys = Object.keys(filters);
    }

    canAsync(...permissions: string[]): Promise<boolean> {
        return this.checkPermissionsAsync(permissions);
    }

    can(...permissions: string[]): boolean {
        return this.checkPermissionsSync(permissions);
    }

    any(...permissions: string[][]): boolean {
        return permissions.some(permission => this.can(...permission));
    }

    async anyAsync(...permissions: string[][]): Promise<boolean> {
        const results = await Promise.all(
            permissions.map(permission => {
                return this.canAsync(...permission);
            }),
        );

        return results.some(result => result);
    }

    private checkPermissionsSync(permissions: string[]): boolean {
        if (!permissions.length) {
            return false;
        }

        for (const permission of permissions) {
            if (!this.grantSet.has(permission)) {
                return false;
            }
        }

        for (const permission of permissions) {
            const explicitFilter = this.extractFilter(permission);
            if (explicitFilter !== null) {
                if (!this.evaluateFilterSync(explicitFilter)) {
                    return false;
                }
                continue;
            }

            const filters = this.getPermissionFilters(permission);
            for (const filter of filters) {
                if (!this.evaluateFilterSync(filter)) {
                    return false;
                }
            }
        }

        return true;
    }

    private async checkPermissionsAsync(permissions: string[]): Promise<boolean> {
        if (!permissions.length) {
            return false;
        }

        for (const permission of permissions) {
            if (!this.grantSet.has(permission)) {
                return false;
            }
        }

        for (const permission of permissions) {
            const explicitFilter = this.extractFilter(permission);
            if (explicitFilter !== null) {
                if (!(await this.evaluateFilterAsync(explicitFilter))) {
                    return false;
                }
                continue;
            }

            const filters = this.getPermissionFilters(permission);
            for (const filter of filters) {
                if (!(await this.evaluateFilterAsync(filter))) {
                    return false;
                }
            }
        }

        return true;
    }

    private extractFilter(permission: string): string | null {
        const atIndex = permission.indexOf('@');
        if (atIndex === -1) {
            return null;
        }
        return permission.slice(atIndex + 1);
    }

    private getPermissionFilters(permission: string): string[] {
        if (!this.filterKeys.length) {
            return [];
        }

        return this.filterKeys.filter((filter) => this.grantSet.has(`${permission}@${filter}`));
    }

    private evaluateFilterSync(filter: string): boolean {
        const filterService = this.filters[filter];
        if (!filterService) {
            return true;
        }

        if (typeof filterService.can === 'function') {
            return filterService.can(this.getFilterParams(filter));
        }

        return false;
    }

    private async evaluateFilterAsync(filter: string): Promise<boolean> {
        const filterService = this.filters[filter];
        if (!filterService) {
            return true;
        }

        if (typeof filterService.canAsync === 'function') {
            return filterService.canAsync(this.getFilterParams(filter));
        }

        if (typeof filterService.can === 'function') {
            return filterService.can(this.getFilterParams(filter));
        }

        return false;
    }

    private getFilterParams(filter: string): unknown[] | null {
        return this.paramsFilter ? this.paramsFilter.getParam(filter) : null;
    }
}
