import { DynamicModule, Global, Module, OnApplicationBootstrap } from '@nestjs/common';
import { RbacService } from './services/rbac.service';
import { ModuleRef, Reflector } from '@nestjs/core';
import { StorageRbacService } from './services/storage.rbac.service';
import { IStorageRbac } from './interfaces/storage.rbac.interface';
import { IDynamicStorageRbac } from './interfaces/dynamic.storage.rbac.interface';
import { ICacheRBAC } from './interfaces/cache.rbac.interface';
import { Ctr } from './ctr/ctr';

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
export class RBAcModule implements OnApplicationBootstrap {
    private static cache?: any | ICacheRBAC;
    private static cacheOptions?: { KEY?: string, TTL?: number };

    constructor(
        private readonly moduleRef: ModuleRef,
    ) {}

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

    static forDynamic<T extends new (...args: any[]) => IDynamicStorageRbac>(
        rbac: T,
        providers?: any[],
        imports?: any[],
    ): DynamicModule {
        const inject = [rbac];
        const commonProviders = [];
        if (RBAcModule.cache) {
            commonProviders.push(RBAcModule.cache, {
                provide: 'ICacheRBAC',
                useFactory: (cache: ICacheRBAC): ICacheRBAC => {
                    return RBAcModule.setCacheOptions(cache);
                },
                inject: [RBAcModule.cache],
            });
            inject.push(RBAcModule.cache);
        }

        commonProviders.push(...[
            ...(providers || []),
            rbac,
            {
                provide: StorageRbacService,
                useFactory: async (rbacService: IDynamicStorageRbac, cache?: ICacheRBAC) => {
                    return new StorageRbacService(rbacService, RBAcModule.setCacheOptions(cache));
                },
                inject,
            },
        ]);

        return {
            module: RBAcModule,
            providers: commonProviders,
            imports: [
                ...(imports || []),
            ],
        };
    }

    private static setCacheOptions(cache?: ICacheRBAC) {
        if (!cache || RBAcModule.cacheOptions) {
            return cache;
        }
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
    }

    onApplicationBootstrap(): any {
        Ctr.ctr = this.moduleRef
    }
}
