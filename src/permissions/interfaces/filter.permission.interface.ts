export interface IFilterPermission<TParams extends unknown[] = unknown[]> {
    // pass only via @RBAcPermissions
    can?(params?: TParams): boolean;

    // pass only via @RBAcAsyncPermissions
    canAsync?(params?: TParams): Promise<boolean>;
}
