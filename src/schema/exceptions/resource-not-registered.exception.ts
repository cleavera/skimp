export class ResourceNotRegisteredException extends Error {
    constructor(resource: string) {
        super(`'${resource}' has not been registered with a schema`);
    }
}
