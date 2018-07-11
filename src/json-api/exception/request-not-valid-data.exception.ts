import { ValidationExceptionCode } from '../../router';
import { ValidationException } from '../../schema';

export class RequestNotValidDataException extends ValidationException {
    constructor(json: any) {
        super(ValidationExceptionCode.INVALID_JSON_DATA, `The request body did not contain serialisable data: ${JSON.stringify(json)}`);
    }
}
