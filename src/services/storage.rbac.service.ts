import { Inject, Injectable, Optional } from '@nestjs/common';
import { IStorageRbac } from '../interfaces/storage.rbac.interface';
import { ModuleRef } from '@nestjs/core';
import { IDynamicStorageRbac } from '../interfaces/dynamic.storage.rbac.interface';
import { ICacheRBAC } from '../interfaces/cache.rbac.interface';

@Injectable()
export class StorageRbacService {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly rbac: IDynamicStorageRbac,
    @Optional() @Inject('ICacheRBAC')
    private readonly cache?: ICacheRBAC,
  ) {

  }

  async getStorage(): Promise<IStorageRbac> {
    return await this.rbac.getRbac();
  }

  async getPermissions(): Promise<object> {
    return (await this.rbac.getRbac()).permissions;
  }

  async getGrants(): Promise<object> {
    return (await this.rbac.getRbac()).grants;
  }

  async getRoles(): Promise<string[]> {
    return (await this.rbac.getRbac()).roles;
  }

  async getGrant(role: string): Promise<string[]> {
    const grant: object = await this.parseGrants();

    return grant[role] || [];
  }

  async getFilters(): Promise<object> {
    const result: any = {};
    const filters = (await this.getStorage()).filters;
    /* tslint:disable */
    for (const key in filters) {
      let filter;
      try {
        filter = this.moduleRef.get(filters[key]);
      } catch (e) {
        filter = await this.moduleRef.create(filters[key]);
      }
      result[key] = filter;
    }

    return result;
  }

  private async parseGrants(): Promise<object> {

    if (this.cache) {
      const cache = await this.getFromCache();
      if (cache) {

        return cache;
      }
    }

    const { grants, permissions } = await this.rbac.getRbac();
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

    if (this.cache) {
      this.setIntoCache(result);
    }

    return result;
  }

  private async getFromCache(): Promise<object | null> {
    return this.cache.get();
  }

  private async setIntoCache(value: object): Promise<void> {
    await this.cache.set(value);
  }
}
