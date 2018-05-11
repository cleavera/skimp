import { SCHEMA_REGISTER } from '../../schema';
import { ValidationFieldInvalidStringException } from '../exceptions/validation-field-invalid-string.exception';

export function String(target: any, propertyKey: string): void {
    SCHEMA_REGISTER.addValidation(target.constructor, (model: any) => {
        if (typeof model[propertyKey] !== 'string' && model[propertyKey] !== undefined) {
            throw new ValidationFieldInvalidStringException(propertyKey, model);
        }
    });
}
