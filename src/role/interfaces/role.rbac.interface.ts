export interface IRoleRbac {
  can(...permissions: string[]): boolean;
  canAsync(...permissions: string[]): Promise<boolean>;
}
