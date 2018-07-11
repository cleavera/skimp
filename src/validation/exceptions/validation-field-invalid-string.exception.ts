import { ModelPointer } from '../../schema';

import { ValidationExceptionCode } from '../constants/validation-exception-code.constant';
import { ModelValidationException } from './model-validation.exception';

export class ValidationFieldInvalidStringException extends ModelValidationException {
    constructor(field: string, model: any) {
        super([new ModelPointer(model, field)], ValidationExceptionCode.INVALID_STRING);
    }
}
