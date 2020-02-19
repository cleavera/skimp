export class RequestBodyNotAllowedException extends Error {
    constructor() {
        super('A request body is not allowed for this content type');
    }
}
