import { IParamsFilter } from './interfaces/params.filter.interface';

export class ParamsFilter<TParams extends unknown[] = unknown[]> implements IParamsFilter<TParams> {
    private storage: Record<string, unknown[]> = {};

    getParam(filter: string): TParams | null {
        return (this.storage[filter] ?? null) as TParams | null;
    }

    setParam(filter: string, ...params: TParams): IParamsFilter<TParams> {
        this.storage[filter] = params;
        return this;
    }

}
