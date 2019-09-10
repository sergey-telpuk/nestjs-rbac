export class RbacExceptions extends Error {
  constructor(message?: string) {
    super(`RBAC: ${message}`);
  }
}
