import { Type } from '@nestjs/common';
import { IFilterPermission } from '../permissions/interfaces/filter.permission.interface';

export type PermissionMap = Record<string, string[]>;
export type GrantMap = Record<string, string[]>;
export type FilterMap = Record<string, Type<IFilterPermission> | IFilterPermission>;

export interface IStorageRbac {
    roles: string[];
    permissions: PermissionMap;
    grants: GrantMap;
    filters: FilterMap;
}
