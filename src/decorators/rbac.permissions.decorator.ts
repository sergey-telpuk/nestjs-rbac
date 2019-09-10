import { SetMetadata } from '@nestjs/common';

export const RBAcPermissions = (...permissions: string[]) => SetMetadata('RBAcPermissions', permissions);
