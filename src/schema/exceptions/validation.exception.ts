import { ValidationExceptionCode } from '../constants/validation-exception-code.constant';

export class ValidationException extends Error {
    public fields: Array<string>;
    public code: ValidationExceptionCode;

    constructor(fields: Array<string>, code: ValidationExceptionCode) {
        super(`Validation issue "${code}" occurred on "${fields.join(',')}"`);
        this.fields = fields;
        this.code = code;
    }
}
