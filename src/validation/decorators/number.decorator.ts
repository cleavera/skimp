import { SCHEMA_REGISTER } from '../../schema';
import { ValidationFieldInvalidNumberException } from '../exceptions/validation-field-invalid-number.exception';

export function Number(target: any, propertyKey: string): void {
    SCHEMA_REGISTER.addValidation(target.constructor, async(model: any) => {
        if (typeof model[propertyKey] !== 'number' && model[propertyKey] !== null) {
            throw new ValidationFieldInvalidNumberException(propertyKey, model);
        }
    });
}
