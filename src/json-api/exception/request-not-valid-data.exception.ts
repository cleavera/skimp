export class RequestNotValidDataException extends Error {
    constructor(json: any) {
        super(`The request body did not contain serialisable data: ${JSON.stringify(json)}`);
    }
}
