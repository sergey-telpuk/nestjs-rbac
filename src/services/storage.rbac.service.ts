import { Injectable } from '@nestjs/common';
import { IStorageRbac } from './interfaces/storage.rbac.interface';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class StorageRbacService {
    constructor(
        private readonly moduleRef: ModuleRef,
        private readonly rbac: IStorageRbac,
    ) {

    }

    getStorage(): IStorageRbac {
        return this.rbac;
    }

    getPermissions(): object {
        return this.rbac.permissions;
    }

    getGrants(): object {
        return this.rbac.grants;
    }

    getRoles(): string[] {
        return this.rbac.roles;
    }

    getGrant(role: string): string[] {
        const grant: object = this.parseGrants();

        return grant[role] || [];
    }

    getFilters(): object {
        const result: any = {};

        Object.keys(this.rbac.filters).map((key): any => {
            result[key] = this.moduleRef.get(this.rbac.filters[key]);
        });

        return result;
    }

    private parseGrants(): object {
        const {grants, permissions} = this.rbac;
        const result = {};
        Object.keys(grants).forEach((key) => {
            const grant = grants[key];

            result[key] = [
                // remove duplicate
                ...new Set(
                    // get extended
                    grant.filter((value: string) => !value.startsWith('&')),
                ),
            ]
            // remove not existed
                .filter((value: string) => {
                    if (value.includes('@')) {
                        const spilt = value.split('@');
                        if (!permissions[spilt[0]]) {
                            return false;
                        }

                        return permissions[spilt[0]].some((inAction) => inAction === spilt[1]);
                    }
                    if (permissions[value]) {
                        return permissions[value];
                    }

                });

        });
        const findExtendedGrants = {};
        Object.keys(grants).forEach((key) => {
            const grant = grants[key];

            findExtendedGrants[key] = [
                // remove duplicate
                ...new Set(
                    // get extended
                    grant.filter((value: string) => {
                        if (value.startsWith('&')) {
                            const subGrant = value.substr(1);
                            if (grants[value.substr(1)] && subGrant !== key) {
                                return true;
                            }
                        }
                        return false;
                    }).map(value => value.substr(1)),
                ),
            ];
        });

        Object.keys(findExtendedGrants).forEach((key) => {
            const grant = findExtendedGrants[key];

            grant.forEach((value) => {
                result[key] = [...new Set([...result[key], ...result[value]])];
            });

        });

        Object.keys(result).forEach((key) => {
            const grant = result[key];

            const per = [];
            grant.forEach((value) => {
                if (!value.includes('@')) {
                    per.push(...permissions[value].map((dd) => {
                        return `${value}@${dd}`;
                    }));
                }
            });

            result[key] = [...new Set([...result[key], ...per])];

        });

        return result;
    }
}
