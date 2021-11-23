import { SetMetadata } from '@nestjs/common';

export const RBAcPermissions = (...permissions: string[]) => SetMetadata('RBAcPermissions', permissions);
export const RBAcAnyPermissions = (...permissions: string[][]) => SetMetadata('RBAcAnyPermissions', permissions);
export const RBAcAsyncPermissions = (...permissions: string[]) => SetMetadata('RBAcAsyncPermissions', permissions);
export const RBAcAnyAsyncPermissions = (...permissions: string[][]) => SetMetadata('RBAcAnyAsyncPermissions', permissions);
