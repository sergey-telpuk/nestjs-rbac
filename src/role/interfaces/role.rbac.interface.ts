export interface IRoleRbac {
  can(...permissions: string[]): boolean;
}
