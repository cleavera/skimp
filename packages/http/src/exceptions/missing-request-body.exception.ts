export class MissingRequestBodyException extends Error {
    constructor() {
        super('This method requires a request body');
    }
}
