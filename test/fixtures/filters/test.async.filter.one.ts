import { IFilterPermission } from '../../../src/permissions/interfaces/filter.permission.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestAsyncFilterOne implements IFilterPermission {

  canAsync(params?: any[]): Promise<boolean> {
    return Promise.resolve(params[0]);
  }

}
