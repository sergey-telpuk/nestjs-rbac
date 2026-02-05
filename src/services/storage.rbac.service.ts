import { Inject, Injectable, Optional } from '@nestjs/common';
import { GrantMap, IStorageRbac, PermissionMap } from '../interfaces/storage.rbac.interface';
import { IDynamicStorageRbac } from '../interfaces/dynamic.storage.rbac.interface';
import { ICacheRBAC } from '../interfaces/cache.rbac.interface';
import { Ctr } from '../ctr/ctr';
import { IFilterPermission } from '../permissions/interfaces/filter.permission.interface';

@Injectable()
export class StorageRbacService {
    constructor(
        @Inject('IDynamicStorageRbac')
        private readonly rbac: IDynamicStorageRbac,
        @Optional() @Inject('ICacheRBAC')
        private readonly cache?: ICacheRBAC,
    ) {

    }

    async getStorage(): Promise<IStorageRbac> {
        return await this.rbac.getRbac();
    }

    async getPermissions(): Promise<PermissionMap> {
        return (await this.rbac.getRbac()).permissions;
    }

    async getGrants(): Promise<GrantMap> {
        return (await this.rbac.getRbac()).grants;
    }

    async getRoles(): Promise<string[]> {
        return (await this.rbac.getRbac()).roles;
    }

    async getGrant(role: string): Promise<string[]> {
        const grants = await this.parseGrants();

        return grants[role] || [];
    }

    async getFilters(): Promise<Record<string, IFilterPermission>> {
        const result: Record<string, IFilterPermission> = {};
        const filters = (await this.getStorage()).filters || {};
        /* tslint:disable */
        for (const key in filters) {
            let filter: IFilterPermission;
            try {
                const filterToken = filters[key];
                if (typeof filterToken === 'function') {
                    filter = Ctr.ctr.get(filterToken);
                } else {
                    filter = filterToken as IFilterPermission;
                }
            } catch {
                const filterToken = filters[key];
                if (typeof filterToken === 'function') {
                    filter = await Ctr.ctr.create(filterToken);
                } else {
                    filter = filterToken as IFilterPermission;
                }
            }
            result[key] = filter;
        }

        return result;
    }

    private async parseGrants(): Promise<GrantMap> {

        if (this.cache) {
            const cache = await this.getFromCache();
            if (cache) {
                return cache;
            }
        }

        const {grants, permissions} = await this.rbac.getRbac();
        const result: GrantMap = {};
        const normalizedGrants: GrantMap = grants || {};
        const normalizedPermissions: PermissionMap = permissions || {};

        const isPermissionValid = (value: string): boolean => {
            if (value.includes('@')) {
                const [permission, action] = value.split('@');
                const actions = normalizedPermissions[permission];
                if (!actions) {
                    return false;
                }
                return actions.includes(action);
            }

            return Boolean(normalizedPermissions[value]);
        };

        Object.keys(normalizedGrants).forEach((key) => {
            const grant = normalizedGrants[key] || [];

            const direct = grant.filter((value: string) => !value.startsWith('&'));
            result[key] = [
                ...new Set(direct.filter(isPermissionValid)),
            ];
        });

        const findExtendedGrants: GrantMap = {};
        Object.keys(normalizedGrants).forEach((key) => {
            const grant = normalizedGrants[key] || [];

            findExtendedGrants[key] = [
                ...new Set(
                    grant
                        .filter((value: string) => value.startsWith('&'))
                        .map((value) => value.slice(1))
                        .filter((value) => value && value !== key && normalizedGrants[value]),
                ),
            ];
        });

        Object.keys(findExtendedGrants).forEach((key) => {
            const grant = findExtendedGrants[key] || [];

            grant.forEach((value) => {
                result[key] = [
                    ...new Set([...(result[key] || []), ...(result[value] || [])]),
                ];
            });
        });

        Object.keys(result).forEach((key) => {
            const grant = result[key] || [];
            const expanded: string[] = [];

            grant.forEach((value) => {
                if (!value.includes('@')) {
                    const actions = normalizedPermissions[value];
                    if (actions) {
                        expanded.push(...actions.map((action) => `${value}@${action}`));
                    }
                }
            });

            result[key] = [...new Set([...grant, ...expanded])];
        });

        if (this.cache) {
            this.setIntoCache(result);
        }

        return result;
    }

    private async getFromCache(): Promise<GrantMap | null> {
        return (await this.cache.get()) as GrantMap | null;
    }

    private async setIntoCache(value: GrantMap): Promise<void> {
        await this.cache.set(value);
    }
}
