import { IRoleRbac } from '../../role/interfaces/role.rbac.interface';
import { IParamsFilter } from '../../params-filter/interfaces/params.filter.interface';

export interface IRbac {

  getRole(role: string, builderFilter?: IParamsFilter): Promise<IRoleRbac>;
}
