import { IFilterPermission } from '../../../src/permissions/interfaces/filter.permission.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestFilterOne implements IFilterPermission {

  can(params?: any[]): boolean {
    return params[0];
  }

}
