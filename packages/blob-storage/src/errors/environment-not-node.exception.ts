export class EnvironmentNotNodeException extends Error {
    constructor() {
        super('Blob storage can only be used in a node environment');
    }
}
