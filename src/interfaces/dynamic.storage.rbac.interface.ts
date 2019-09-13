import { IStorageRbac } from './storage.rbac.interface';

export interface IDynamicStorageRbac {
  getRbac(): Promise<IStorageRbac>;
}
