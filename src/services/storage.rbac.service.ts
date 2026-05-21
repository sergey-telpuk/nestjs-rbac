import { Inject, Injectable, Optional } from '@nestjs/common';
import { GrantMap, IStorageRbac, PermissionMap } from '../interfaces/storage.rbac.interface';
import { IDynamicStorageRbac } from '../interfaces/dynamic.storage.rbac.interface';
import { ICacheRBAC } from '../interfaces/cache.rbac.interface';
import { Ctr } from '../ctr/ctr';
import { IFilterPermission } from '../permissions/interfaces/filter.permission.interface';

@Injectable()
export class StorageRbacService {
    private readonly parsedGrantCache = new WeakMap<IStorageRbac, GrantMap>();
    private readonly resolvedFilterCache = new WeakMap<IStorageRbac, Record<string, IFilterPermission>>();

    constructor(
        @Inject('IDynamicStorageRbac')
        private readonly rbac: IDynamicStorageRbac,
        @Optional() @Inject('ICacheRBAC')
        private readonly cache?: ICacheRBAC,
    ) {}

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
        const storage = await this.getStorage();
        const cached = this.resolvedFilterCache.get(storage);
        if (cached) {
            return cached;
        }

        const filters = storage.filters || {};
        const result: Record<string, IFilterPermission> = {};

        for (const key of Object.keys(filters)) {
            const filterToken = filters[key];
            if (typeof filterToken !== 'function') {
                result[key] = filterToken as IFilterPermission;
                continue;
            }

            try {
                result[key] = Ctr.ctr.get(filterToken);
            } catch {
                result[key] = await Ctr.ctr.create(filterToken);
            }
        }

        this.resolvedFilterCache.set(storage, result);
        return result;
    }

    private async parseGrants(): Promise<GrantMap> {
        if (this.cache) {
            const cached = (await this.cache.get()) as GrantMap | null;
            if (cached) {
                return cached;
            }
        }

        const storage = await this.rbac.getRbac();
        const memoized = this.parsedGrantCache.get(storage);
        if (memoized) {
            if (this.cache) {
                void this.cache.set(memoized);
            }
            return memoized;
        }

        const { grants, permissions } = storage;
        const normalizedGrants: GrantMap = grants || {};
        const normalizedPermissions: PermissionMap = permissions || {};

        const isPermissionValid = (value: string): boolean => {
            const atIndex = value.indexOf('@');
            if (atIndex !== -1) {
                const permission = value.slice(0, atIndex);
                const action = value.slice(atIndex + 1);
                const actions = normalizedPermissions[permission];
                if (!actions) {
                    return false;
                }
                return actions.includes(action);
            }
            return Boolean(normalizedPermissions[value]);
        };

        const result: GrantMap = {};
        const findExtendedGrants: GrantMap = {};

        for (const key of Object.keys(normalizedGrants)) {
            const grant = normalizedGrants[key] || [];
            const direct: string[] = [];
            const extended: string[] = [];

            for (const value of grant) {
                if (value.startsWith('&')) {
                    const ref = value.slice(1);
                    if (ref && ref !== key && normalizedGrants[ref]) {
                        extended.push(ref);
                    }
                } else if (isPermissionValid(value)) {
                    direct.push(value);
                }
            }

            result[key] = [...new Set(direct)];
            findExtendedGrants[key] = [...new Set(extended)];
        }

        for (const key of Object.keys(findExtendedGrants)) {
            const refs = findExtendedGrants[key];
            for (const ref of refs) {
                const refGrants = result[ref];
                if (refGrants && refGrants.length) {
                    result[key] = [...new Set([...result[key], ...refGrants])];
                }
            }
        }

        for (const key of Object.keys(result)) {
            const grant = result[key];
            const expanded: string[] = [];

            for (const value of grant) {
                if (!value.includes('@')) {
                    const actions = normalizedPermissions[value];
                    if (actions) {
                        for (const action of actions) {
                            expanded.push(`${value}@${action}`);
                        }
                    }
                }
            }

            if (expanded.length) {
                result[key] = [...new Set([...grant, ...expanded])];
            }
        }

        this.parsedGrantCache.set(storage, result);

        if (this.cache) {
            void this.cache.set(result);
        }

        return result;
    }
}
