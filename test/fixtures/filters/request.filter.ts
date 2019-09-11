import { IFilterPermission } from "../../../src/permissions/interfaces/filter.permission.interfac";

export class RequestFilter implements IFilterPermission {

  can(params?: any[]): boolean {
    return params[0].headers['test-header'] === 'test';
  }

}
