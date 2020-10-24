import { Injectable } from '@nestjs/common';
import { IRoleRbac } from './interfaces/role.rbac.interface';
import { IFilterPermission } from '../permissions/interfaces/filter.permission.interface';
import { IParamsFilter } from '../params-filter/interfaces/params.filter.interface';

@Injectable()
export class RoleRbac implements IRoleRbac {

  constructor(
    private readonly role: string,
    private readonly grant: string[],
    private readonly filters: object,
    private readonly paramsFilter?: IParamsFilter,
  ) {
  }

  async canAsync(...permissions: string[]): Promise<boolean> {
    return this.checkPermissions<Promise<boolean>>(permissions, 'canAsync');
  }

  can(...permissions: string[]): boolean {
    return this.checkPermissions<boolean>(permissions, 'can');
  }

  private checkPermissions<T>(permissions, methodName): T {
    if (!permissions.length) {
      return (<any>false);
    }
    // check grant
    for (const permission of permissions) {
      if (!this.grant.includes(permission)) {
        return (<any>false);
      }
    }

    // check custom filter
    for (const permission of permissions) {
      // check particular permission [permission@action]
      if (
        this.grant.includes(permission)
        && permission.includes('@')
      ) {
        const filter: string = permission.split('@')[1];
        const filterService: IFilterPermission = this.filters[filter];
        if (filterService) {
          return filterService?.[methodName]?.(
            this.paramsFilter ? this.paramsFilter.getParam(filter) : null,
          ) ?? true
        }
      }
      // check particular permission [permission]
      if (this.grant.includes(permission)
        && !permission.includes('@')) {

        for (const filter in this.filters) {
          if (
            this.filters.hasOwnProperty(filter) &&
            this.grant.includes(`${permission}@${filter}`)
          ) {
            return this.filters[filter]?.[methodName]?.(
              this.paramsFilter ? this.paramsFilter.getParam(filter) : null,
            ) ?? true
          }
        }
      }
    }

    return (<any>true);
  }
}
