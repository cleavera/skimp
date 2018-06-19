import { FieldType, ISchema, SCHEMA_REGISTER } from '../../schema';

import { ValidationFieldInvalidNumberException } from '../exceptions/validation-field-invalid-number.exception';

export function Number(target: any, propertyKey: string): void {
    const schema: ISchema = target.constructor;

    SCHEMA_REGISTER.addValidation(schema, async(model: any) => {
        if (typeof model[propertyKey] !== 'number' && model[propertyKey] !== null) {
            throw new ValidationFieldInvalidNumberException(propertyKey, model);
        }
    });

    SCHEMA_REGISTER.setFieldType(schema, propertyKey, FieldType.NUMBER);
}
