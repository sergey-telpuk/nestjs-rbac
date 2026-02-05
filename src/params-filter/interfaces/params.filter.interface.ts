export interface IParamsFilter<TParams extends unknown[] = unknown[]> {
    setParam(filter: string, ...params: TParams): IParamsFilter<TParams>;

    getParam(filter: string): TParams | null;
}
