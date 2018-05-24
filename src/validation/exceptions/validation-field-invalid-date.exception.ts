import { ValidationExceptionCode } from '../../router';
import { ModelPointer } from '../../schema';
import { ModelValidationException } from './model-validation.exception';

export class ValidationFieldInvalidDateException extends ModelValidationException {
    constructor(field: string, model: any) {
        super([new ModelPointer(model, field)], ValidationExceptionCode.INVALID_DATE);
    }
}