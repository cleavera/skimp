import { SCHEMA_REGISTER } from '../constants/schema-register.constant';
import { ValidationFieldInvalidNumberException } from '../exceptions/validation-field-invalid-number.exception';

export function Number(target: any, propertyKey: string): void {
    SCHEMA_REGISTER.addValidation(target.constructor, (model: any) => {
        if (typeof model[propertyKey] !== 'number' && model[propertyKey] !== undefined) {
            throw new ValidationFieldInvalidNumberException(propertyKey, model);
        }
    });
}
