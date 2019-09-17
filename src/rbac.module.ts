import { DynamicModule, Global, Module } from '@nestjs/common';
import { RbacService } from './services/rbac.service';
import { ModuleRef, Reflector } from '@nestjs/core';
import { StorageRbacService } from './services/storage.rbac.service';
import { IStorageRbac } from './interfaces/storage.rbac.interface';
import { IDynamicStorageRbac } from './interfaces/dynamic.storage.rbac.interface';
import { ICacheRBAC } from './interfaces/cache.rbac.interface';

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
  private static cache?: any | ICacheRBAC;
  private static cacheOptions?: { KEY?: string, TTL?: number };

  static useCache(
    cache: any | ICacheRBAC,
    options?: {
      KEY?: string,
      TTL?: number
    },
  ) {
    RBAcModule.cache = cache;
    RBAcModule.cacheOptions = options;
    return RBAcModule;
  }

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
    const inject = [ModuleRef, rbac];

    if (RBAcModule.cache) {
      inject.push(RBAcModule.cache);
    }

    const commonProviders = [
      ...(providers || []),
      rbac,
      {
        provide: StorageRbacService,
        useFactory: async (moduleRef: ModuleRef, rbacService: IDynamicStorageRbac, cache?: ICacheRBAC) => {
          if (cache && !RBAcModule.cacheOptions) {
            return cache;
          }
          if (cache && RBAcModule.cacheOptions.KEY) {
            cache.KEY = RBAcModule.cacheOptions.KEY;
          }

          if (cache && RBAcModule.cacheOptions.TTL) {
            cache.TTL = RBAcModule.cacheOptions.TTL;
          }
          return new StorageRbacService(moduleRef, rbacService, cache);
        },
        inject,
      },
    ];

    if (RBAcModule.cache) {
      commonProviders.push(RBAcModule.cache, {
        provide: 'ICacheRBAC',
        useFactory: (cache: ICacheRBAC): ICacheRBAC => {
          if (!RBAcModule.cacheOptions) {
            return cache;
          }
          if (RBAcModule.cacheOptions.KEY) {
            cache.KEY = RBAcModule.cacheOptions.KEY;
          }

          if (RBAcModule.cacheOptions.TTL) {
            cache.TTL = RBAcModule.cacheOptions.TTL;
          }

          return cache;
        },
        inject: [RBAcModule.cache],
      });
    }

    return {
      module: RBAcModule,
      providers: commonProviders,
      imports: [
        ...(imports || []),
      ],
    };
  }
}
