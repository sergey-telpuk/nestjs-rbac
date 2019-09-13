import { IFilterPermission } from '../../../src/permissions/interfaces/filter.permission.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestFilterTwo implements IFilterPermission {

  can(params?: any[]): boolean {
    return params[0];
  }

}
