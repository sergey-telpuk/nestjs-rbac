export interface IRoleRbac {
  can(...permissions: string[]): Promise<boolean>;
}
