import { ModelPointer, ValidationExceptionCode } from '@skimp/schema';

import { ModelValidationException } from './model-validation.exception';

export class ValidationFieldNotValidOptionException extends ModelValidationException {
    constructor(field: string, model: object) {
        super([new ModelPointer(model, field)], ValidationExceptionCode.INVALID_OPTION);
    }
}
