import { SCHEMA_REGISTER } from '../../schema';
import { ValidationFieldInvalidIntegerException } from '../exceptions/validation-field-invalid-integer.exception';

export function Integer(target: any, propertyKey: string): void {
    SCHEMA_REGISTER.addValidation(target.constructor, (model: any) => {
        if ((typeof model[propertyKey] !== 'number' || !Number.isInteger(model[propertyKey])) && model[propertyKey] !== undefined) {
            throw new ValidationFieldInvalidIntegerException(propertyKey, model);
        }
    });
}
