import { IStorageRbac } from '../../src/interfaces/storage.rbac.interface';
import { TestFilterOne } from './filters/test.filter.one';
import { TestFilterTwo } from './filters/test.filter.two';
import { TestAsyncFilterOne } from './filters/test.async.filter.one';
import { TestAsyncFilterTwo } from './filters/test.async.filter.two';
import { ASYNC_RBAC_REQUEST_FILTER, RBAC_REQUEST_FILTER } from '../../src/constans';
import { RequestFilter } from './filters/request.filter';
import { RequestAsyncFilter } from './filters/request.async.filter';

export const RBAC: IStorageRbac = {
  roles: ['admin', 'user'],
  permissions: {
    permission1: ['create', 'update', 'delete'],
    permission2: ['create', 'update', 'delete'],
    permission3: ['filter1', 'filter2', RBAC_REQUEST_FILTER],
    permission4: ['create', 'update', 'delete'],
    permission5: ['ASYNC_filter1', 'ASYNC_filter2', ASYNC_RBAC_REQUEST_FILTER],
  },
  grants: {
    admin: [
      '&user',
      'permission1',
      'permission3',
      'permission5',
    ],
    user: ['&userRoot', 'permission2', 'permission1@create', 'permission3@filter1', 'permission5@ASYNC_filter1'],
    userRoot: ['permission4'],

  },
  filters: {
    filter1: TestFilterOne,
    filter2: TestFilterTwo,
    ASYNC_filter1: TestAsyncFilterOne,
    ASYNC_filter2: TestAsyncFilterTwo,
    [RBAC_REQUEST_FILTER]: RequestFilter,
    [ASYNC_RBAC_REQUEST_FILTER]: RequestAsyncFilter,
  },
};
