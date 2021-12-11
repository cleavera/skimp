export class RequestNotHttpTriggerException extends Error {
    constructor() {
        super('Supports http triggers only');
    }
}
