import { IFilterPermission } from '../permissions/interfaces/filter.permission.interface';

export interface IStorageRbac {
  roles: string[];
  permissions: object;
  grants: object;
  filters: { [key: string]: any | IFilterPermission };
}
