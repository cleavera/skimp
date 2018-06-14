import { SCHEMA_REGISTER } from '../../schema';

import { ValidationFieldInvalidStringException } from '../exceptions/validation-field-invalid-string.exception';

export function String(target: any, propertyKey: string): void {
    SCHEMA_REGISTER.addValidation(target.constructor, async(model: any) => {
        if (typeof model[propertyKey] !== 'string' && model[propertyKey] !== null) {
            throw new ValidationFieldInvalidStringException(propertyKey, model);
        }
    });
}
