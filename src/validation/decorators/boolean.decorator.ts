import { SCHEMA_REGISTER } from '../../schema';
import { ValidationFieldInvalidBooleanException } from '../exceptions/validation-field-invalid-boolean.exception';

export function Boolean(target: any, propertyKey: string): void {
    SCHEMA_REGISTER.addValidation(target.constructor, async(model: any) => {
        if (typeof model[propertyKey] !== 'boolean' && model[propertyKey] !== null) {
            throw new ValidationFieldInvalidBooleanException(propertyKey, model);
        }
    });
}
