export class DuplicateResourceNameException extends Error {
    constructor(resourceName: string) {
        super(`${resourceName} is already registered to a schema`);
    }
}
