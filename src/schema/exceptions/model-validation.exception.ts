import { ValidationException } from '../../router';
import { ValidationExceptionCode } from '../constants/validation-exception-code.constant';

export class ModelValidationException extends ValidationException {
    public fields: Array<string>;
    public code: ValidationExceptionCode;

    constructor(fields: Array<string>, code: ValidationExceptionCode) {
        super(`Validation issue "${code}" occurred on "${fields.join(',')}"`);
        this.fields = fields;
        this.code = code;
    }
}
