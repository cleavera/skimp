import { ValidationExceptionCode } from '../constants/validation-exception-code.constant';
import { ValidationException } from './validation.exception';

export class ValidationMissingRequiredFieldException extends ValidationException {
    constructor(field: string) {
        super([field], ValidationExceptionCode.REQUIRED);
    }
}
