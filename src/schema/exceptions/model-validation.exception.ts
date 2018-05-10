import { ValidationException, ValidationExceptionCode } from '../../router';
import { ModelPointer } from '../classes/model-pointer';

export class ModelValidationException extends ValidationException {
    public fields: Array<ModelPointer>;
    public code: ValidationExceptionCode;

    constructor(fields: Array<ModelPointer>, code: ValidationExceptionCode) {
        super(code, `Validation issue "${code}" occurred on "${fields.join(',')}"`);
        this.fields = fields;
    }
}
