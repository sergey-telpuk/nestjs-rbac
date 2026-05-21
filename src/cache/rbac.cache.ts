import { Injectable } from '@nestjs/common';
import { ICacheRBAC } from '../interfaces/cache.rbac.interface';
import * as NodeCache from 'node-cache';

@Injectable()
export class RbacCache implements ICacheRBAC {
    KEY = 'RBAC';
    TTL = 0;

    private readonly cache: NodeCache = new NodeCache();

    get(): object | null {
        return (this.cache.get(this.KEY) as object | undefined) ?? null;
    }

    set(value: object): void {
        this.cache.set(this.KEY, value, this.TTL);
    }

    del(): void {
        this.cache.del(this.KEY);
    }
}
