import { SCHEMA_REGISTER } from '../../schema';
import { ValidationFieldInvalidBooleanException } from '../exceptions/validation-field-invalid-boolean.exception';

export function Boolean(target: any, propertyKey: string): void {
    SCHEMA_REGISTER.addValidation(target.constructor, (model: any) => {
        if (typeof model[propertyKey] !== 'boolean' && model[propertyKey] !== undefined) {
            throw new ValidationFieldInvalidBooleanException(propertyKey, model);
        }
    });
}
