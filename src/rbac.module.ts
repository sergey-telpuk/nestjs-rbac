import { DynamicModule, Global, Module, ModuleMetadata, OnApplicationBootstrap, Provider, Type } from '@nestjs/common';
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
    private static cache?: Type<ICacheRBAC>;
    private static cacheOptions?: { KEY?: string, TTL?: number };

    constructor(
        private readonly moduleRef: ModuleRef,
    ) {}

    static useCache(
        cache: Type<ICacheRBAC>,
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
        providers?: Provider[],
        imports?: ModuleMetadata['imports'],
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

    static forDynamic<T extends Type<IDynamicStorageRbac>>(
        rbac: T,
        providers?: Provider[],
        imports?: ModuleMetadata['imports'],
    ): DynamicModule {
        const inject: Array<Type<unknown>> = [rbac];
        const commonProviders: Provider[] = [];
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
        if (!cache || !RBAcModule.cacheOptions) {
            return cache;
        }
        if (RBAcModule.cacheOptions.KEY) {
            cache.KEY = RBAcModule.cacheOptions.KEY;
        }

        if (RBAcModule.cacheOptions.TTL !== undefined) {
            cache.TTL = RBAcModule.cacheOptions.TTL;
        }

        return cache;
    }

    onApplicationBootstrap(): void {
        Ctr.ctr = this.moduleRef;
    }
}
