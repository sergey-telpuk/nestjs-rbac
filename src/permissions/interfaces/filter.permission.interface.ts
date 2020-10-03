export interface IFilterPermission {
  // pass only via @RBAcPermissions
  can(params?: any[]): boolean | Promise<boolean>;
}
