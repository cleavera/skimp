import { ModelPointer } from '../../schema';

import { ValidationExceptionCode } from '../../schema/constants/validation-exception-code.constant';
import { ModelValidationException } from './model-validation.exception';

export class ValidationFieldNotValidOptionException extends ModelValidationException {
    constructor(field: string, model: any) {
        super([new ModelPointer(model, field)], ValidationExceptionCode.INVALID_OPTION);
    }
}
