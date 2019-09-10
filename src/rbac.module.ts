import { DynamicModule, Global, Module } from '@nestjs/common';
import { RbacService } from './services/rbac.service';
import { ModuleRef, Reflector } from '@nestjs/core';
import { StorageRbacService } from './services/storage.rbac.service';
import { IStorageRbac } from './services/interfaces/storage.rbac.interface';

@Global()
@Module({
  providers: [
    RbacService,
    StorageRbacService,
    Reflector,
  ],
  imports: [],
  exports: [
    RbacService,
  ],
})
export class RBAcModule {
  static forRoot(
    rbac: IStorageRbac,
    providers?: any[],
    imports?: any[],
  ): DynamicModule {
    return {
      module: RBAcModule,
      providers: [
        ...Object.keys(rbac.filters).map((key): any => rbac.filters[key]),
        ...(providers || []),
        {
          provide: StorageRbacService,
          useFactory: (moduleRef: ModuleRef) => {
            return new StorageRbacService(moduleRef, rbac);
          },
          inject: [ModuleRef],
        },
      ],
      imports: [
        ...(imports || []),
      ],
    };
  }
}
