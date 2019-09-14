import { IDynamicStorageRbac, IStorageRbac } from '../../../src';
import { RBAC } from '../storage';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AsyncService implements IDynamicStorageRbac{
  async getRbac(): Promise<IStorageRbac> {
    return new Promise((resolve) => {
      // resolve(RBAC)
        setTimeout(() => {
            resolve(RBAC);
        },1000);
    });
  }
}
