import { IFilterPermission } from '../../../src/permissions/interfaces/filter.permission.interface';

export class TestFilterTwo implements IFilterPermission {

  can(params?: any[]): boolean {
    return params[0];
  }

}
