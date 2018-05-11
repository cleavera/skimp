import { ValidationExceptionCode } from '../../router';
import { ModelPointer } from '../classes/model-pointer';
import { ModelValidationException } from './model-validation.exception';

export class ValidationFieldInvalidBooleanException extends ModelValidationException {
    constructor(field: string, model: any) {
        super([new ModelPointer(model, field)], ValidationExceptionCode.INVALID_BOOLEAN);
    }
}
