export class NoLoggerException extends Error {
    constructor() {
        super('No logger has been configured');
    }
}
