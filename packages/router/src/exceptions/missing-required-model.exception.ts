export class MissingRequiredModelException extends Error {
    constructor() {
        super('This method requires a request body');
    }
}
