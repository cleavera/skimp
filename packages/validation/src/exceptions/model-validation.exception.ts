import { ModelPointer, ValidationException, ValidationExceptionCode } from '@skimp/schema';

export class ModelValidationException extends ValidationException {
    public fields: Array<ModelPointer>;
    public code!: ValidationExceptionCode;

    constructor(fields: Array<ModelPointer>, code: ValidationExceptionCode) {
        super(code, `Validation issue "${code}" occurred on "${fields.join(',')}"`);
        this.fields = fields;
    }
}
