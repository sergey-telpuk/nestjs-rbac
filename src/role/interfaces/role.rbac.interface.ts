export interface IRoleRbac {
    can(...permissions: string[]): boolean;

    canAsync(...permissions: string[]): Promise<boolean>;

    any(...permissions: string[][]): boolean;

    anyAsync(...permissions: string[][]): Promise<boolean>;
}
