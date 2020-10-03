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

  async can(...permissions: string[]): Promise<boolean> {
    if (!permissions.length) {
      return false;
    }
    // check grant
    for (const permission of permissions) {
      if (!this.grant.includes(permission)) {
        return false;
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
        const isGranted = filterService ? await Promise.resolve(
          filterService.can(
            this.paramsFilter ? this.paramsFilter.getParam(filter) : null,
          )
        ) : false;

        if (filterService && !isGranted) {
          return false;
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
            const isGranted = await Promise.resolve(
              this.filters[filter].can(
                this.paramsFilter ? this.paramsFilter.getParam(filter) : null,
              )
            );
            if (!isGranted) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }
}
