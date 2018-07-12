import { ModelPointer, ValidationExceptionCode } from '../../../schema/src/index';

import { ModelValidationException } from './model-validation.exception';

export class ValidationFieldRequiredException extends ModelValidationException {
    constructor(field: string, model: any) {
        super([new ModelPointer(model, field)], ValidationExceptionCode.REQUIRED);
    }
}
