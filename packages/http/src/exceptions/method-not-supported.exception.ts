export class MethodNotSupportedException extends Error {
    constructor(method: string | null = null) {
        super(`Unknown request method: "${method ?? ''}"`);
    }
}
