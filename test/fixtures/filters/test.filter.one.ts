import { IFilterPermission } from '../../../src/permissions/interfaces/filter.permission.interface';

export class TestFilterOne implements IFilterPermission{

    can(params?: any[]): boolean {
        return params[0];
    }

}
