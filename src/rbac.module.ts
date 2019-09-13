import { DynamicModule, Global, Module } from '@nestjs/common';
import { RbacService } from './services/rbac.service';
import { ModuleRef, Reflector } from '@nestjs/core';
import { StorageRbacService } from './services/storage.rbac.service';
import { IStorageRbac } from './interfaces/storage.rbac.interface';
import { IDynamicStorageRbac } from './interfaces/dynamic.storage.rbac.interface';

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

    return RBAcModule.forDynamic(
      /* tslint:disable */
      class {
        async getRbac(): Promise<IStorageRbac> {
          return rbac;
        };
      },
      providers,
      imports,
    );
  }

   static forDynamic(
    rbac: new () => IDynamicStorageRbac,
    providers?: any[],
    imports?: any[],
  ): DynamicModule {
    return {
      module: RBAcModule,
      providers: [
        ...(providers || []),
        rbac,
        {
          provide: StorageRbacService,
          useFactory: (moduleRef: ModuleRef, rbacService: IDynamicStorageRbac) => {
            return new StorageRbacService(moduleRef, rbacService);
          },
          inject: [ModuleRef, rbac],
        },
      ],
      imports: [
        ...(imports || []),
      ],
    };
  }
}
