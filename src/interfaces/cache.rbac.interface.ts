export interface ICacheRBAC {
  KEY: string;
  TTL: number;

  get(): object | null;

  /**
   *
   * @param value
   */
  set(value: object): void;

  del(): void;
}
