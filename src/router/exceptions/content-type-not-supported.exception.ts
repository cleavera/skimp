export class ContentTypeNotSupportedException extends Error {
    constructor(contentType: string) {
        super(`Content type "${contentType}" has not been configured`);
    }
}
