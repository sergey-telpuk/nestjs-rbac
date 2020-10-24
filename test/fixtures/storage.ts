import { IStorageRbac } from '../../src/interfaces/storage.rbac.interface';
import { TestFilterOne } from './filters/test.filter.one';
import { TestFilterTwo } from './filters/test.filter.two';
import { TestAsyncFilterOne } from './filters/test.async.filter.one';
import { TestAsyncFilterTwo } from './filters/test.async.filter.two';
import { RBAC_REQUEST_FILTER } from '../../src/constans';
import { RequestFilter } from './filters/request.filter';

export const RBAC: IStorageRbac = {
  roles: ['admin', 'user'],
  permissions: {
    permission1: ['create', 'update', 'delete'],
    permission2: ['create', 'update', 'delete'],
    permission3: ['filter1', 'filter2', RBAC_REQUEST_FILTER],
    permission4: ['create', 'update', 'delete'],
    permission5: ['asyncFilter1', 'asyncFilter2'],
  },
  grants: {
    admin: [
      '&user',
      'permission1',
      'permission3',
      'permission5',
    ],
    user: ['&userRoot', 'permission2', 'permission1@create', 'permission3@filter1', 'permission5@asyncFilter1'],
    userRoot: ['permission4'],

  },
  filters: {
    filter1: TestFilterOne,
    filter2: TestFilterTwo,
    asyncFilter1: TestAsyncFilterOne,
    asyncFilter2: TestAsyncFilterTwo,
    [RBAC_REQUEST_FILTER]: RequestFilter,
  },
};
