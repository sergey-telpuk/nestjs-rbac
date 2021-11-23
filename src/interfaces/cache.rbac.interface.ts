export interface ICacheRBAC {
    KEY: string;
    TTL: number;

    get(): object | null;
    set(value: object): void;

    del(): void;
}
