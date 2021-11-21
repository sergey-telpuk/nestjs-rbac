import {
  DynamicModule,
  FactoryProvider,
  Global,
  Module,
  Provider
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';

import { ICacheRBAC } from './interfaces/cache.rbac.interface';
import { IDynamicStorageRbac } from './interfaces/dynamic.storage.rbac.interface';
import { IStorageRbac } from './interfaces/storage.rbac.interface';
import { RbacService } from './services/rbac.service';
import { StorageRbacService } from './services/storage.rbac.service';

@Global()
@Module({
  providers: [RbacService, StorageRbacService, Reflector],
  imports: [],
  exports: [RbacService]
})
export class RbacModule {
  private static cache?: any | ICacheRBAC;
  private static cacheOptions?: { KEY?: string; TTL?: number };

  static useCache(
    cache: any | ICacheRBAC,
    options?: {
      KEY?: string;
      TTL?: number;
    }
  ) {
    RbacModule.cache = cache;
    RbacModule.cacheOptions = options;
    return RbacModule;
  }

  static forRoot(
    rbac: IStorageRbac,
    providers?: any[],
    imports?: any[]
  ): DynamicModule {
    return RbacModule.forDynamic(
      class {
        async getRbac(): Promise<IStorageRbac> {
          return rbac;
        }
      },
      providers,
      imports
    );
  }

  static forDynamic(
    rbac: new () => IDynamicStorageRbac,
    providers?: any[],
    imports?: any[]
  ): DynamicModule {
    const inject = [ModuleRef, rbac];
    const commonProviders: Provider<any>[] = [];
    if (RbacModule.cache) {
      commonProviders.push(RbacModule.cache, {
        provide: 'ICacheRBAC',
        useFactory: (cache: ICacheRBAC): ICacheRBAC => {
          return RbacModule.setCacheOptions(cache);
        },
        inject: [RbacModule.cache]
      });
      inject.push(RbacModule.cache);
    }

    const storageRbacService: FactoryProvider = {
      provide: StorageRbacService,
      useFactory: async (
        moduleRef: ModuleRef,
        rbacService: IDynamicStorageRbac,
        cache?: ICacheRBAC
      ) => {
        return new StorageRbacService(
          moduleRef,
          rbacService,
          RbacModule.setCacheOptions(cache)
        );
      },
      inject
    };

    commonProviders.push(...[...(providers || []), rbac], storageRbacService);

    return {
      module: RbacModule,
      providers: commonProviders,
      imports: [...(imports || [])]
    };
  }

  private static setCacheOptions(cache?: ICacheRBAC) {
    if (!cache || RbacModule.cacheOptions) {
      return cache;
    }
    if (!RbacModule.cacheOptions) {
      return cache;
    }
    if (RbacModule.cacheOptions.KEY) {
      cache.KEY = RbacModule.cacheOptions.KEY;
    }

    if (RbacModule.cacheOptions.TTL) {
      cache.TTL = RbacModule.cacheOptions.TTL;
    }

    return cache;
  }
}
