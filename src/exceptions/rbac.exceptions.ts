export class RbacExceptions extends Error {
    constructor(message?: string) {
        super(`RBAC: ${message}`);
        this.name = 'RbacExceptions';
        Object.setPrototypeOf(this, RbacExceptions.prototype);
    }
}
