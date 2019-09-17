import { ICacheRBAC, IDynamicStorageRbac, IStorageRbac } from '../../../src';
import { RBAC } from '../storage';
import { Inject, Injectable, Optional } from '@nestjs/common';

@Injectable()
export class AsyncService implements IDynamicStorageRbac {
  constructor(
    @Optional() @Inject('ICacheRBAC')
    private readonly cache?: ICacheRBAC,
  ){

  }
  async getRbac(): Promise<IStorageRbac> {
    return new Promise((resolve) => {
      resolve(RBAC);
    });
  }
}
