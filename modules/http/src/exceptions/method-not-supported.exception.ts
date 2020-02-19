export class MethodNotSupportedException extends Error {
    constructor(method: string) {
        super(`Unknown request method: "${method}"`);
    }
}
