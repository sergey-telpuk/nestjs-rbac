export interface ICacheRBAC {
    KEY: string;
    TTL: number;

    get(): object | null | Promise<object | null>;
    set(value: object): void | Promise<void>;

    del(): void | Promise<void>;
}
