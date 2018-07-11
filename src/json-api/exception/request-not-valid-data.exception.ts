import { ValidationException } from '../../schema';
import { ValidationExceptionCode } from '../../validation';

export class RequestNotValidDataException extends ValidationException {
    constructor(json: any) {
        super(ValidationExceptionCode.INVALID_JSON_DATA, `The request body did not contain serialisable data: ${JSON.stringify(json)}`);
    }
}
