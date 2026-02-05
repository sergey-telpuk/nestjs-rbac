import { IFilterPermission } from '../../../src/permissions/interfaces/filter.permission.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestAsyncFilterOne implements IFilterPermission {

  canAsync(params?: unknown[]): Promise<boolean> {
    return Promise.resolve(Boolean(params?.[0]));
  }

}
