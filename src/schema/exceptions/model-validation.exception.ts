import { ValidationException, ValidationExceptionCode } from '../../router';

export class ModelValidationException extends ValidationException {
    public fields: Array<string>;
    public code: ValidationExceptionCode;

    constructor(fields: Array<string>, code: ValidationExceptionCode) {
        super(code, `Validation issue "${code}" occurred on "${fields.join(',')}"`);
        this.fields = fields;
    }
}
