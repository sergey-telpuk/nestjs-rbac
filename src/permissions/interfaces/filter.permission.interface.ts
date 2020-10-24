export interface IFilterPermission {
  // pass only via @RBAcPermissions
  can?(params?: any[]): boolean;
  canAsync?(params?: any[]): Promise<boolean>;
}
