import { ValidationException, ValidationExceptionCode } from '@skimp/schema';

export class RequestNotValidDataException extends ValidationException {
    constructor(json: unknown) {
        super(ValidationExceptionCode.INVALID_JSON_DATA, `The request body did not contain serialisable data: ${JSON.stringify(json)}`);
    }
}
