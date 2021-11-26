export interface IFilterPermission {
    // pass only via @RBAcPermissions
    can?(params?: any[]): boolean;

    // pass only via @RBAcAsyncPermissions
    canAsync?(params?: any[]): Promise<boolean>;
}
