import { Injectable } from '@nestjs/common';
import { IRbac } from './interfaces/rbac.interface';
import { StorageRbacService } from './storage.rbac.service';
import { RoleRbac } from '../role/role.rbac';
import { IRoleRbac } from '../role/interfaces/role.rbac.interface';
import { RbacExceptions } from '../exceptions/rbac.exceptions';
import { IParamsFilter } from '../params-filter/interfaces/params.filter.interface';

@Injectable()
export class RbacService implements IRbac {

  constructor(
    private readonly  storageRbacService: StorageRbacService,
  ) {
  }

  async getRole(role: string, paramsFilter?: IParamsFilter): Promise<IRoleRbac> {
    const storage = await this.storageRbacService.getStorage();
    if (!storage.roles || !storage.roles.includes(role)) {
      throw new RbacExceptions('There is no exist a role.');
    }

    return new RoleRbac(
      role,
      await this.storageRbacService.getGrant(role),
      await this.storageRbacService.getFilters(),
      paramsFilter,
    );
  }
}
