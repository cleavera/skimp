import { ValidationExceptionCode } from '../constants/validation-exception-code.constant';
import { ModelValidationException } from './model-validation.exception';

export class ValidationMissingRequiredFieldException extends ModelValidationException {
    constructor(field: string) {
        super([field], ValidationExceptionCode.REQUIRED);
    }
}
