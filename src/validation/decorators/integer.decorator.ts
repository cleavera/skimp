import { FieldType, ISchema, SCHEMA_REGISTER } from '../../schema';

import { ValidationFieldInvalidIntegerException } from '../exceptions/validation-field-invalid-integer.exception';

export function Integer(target: any, propertyKey: string): void {
    const schema: ISchema = target.constructor;

    SCHEMA_REGISTER.addValidation(schema, async(model: any) => {
        if ((typeof model[propertyKey] !== 'number' || !Number.isInteger(model[propertyKey])) && model[propertyKey] !== null) {
            throw new ValidationFieldInvalidIntegerException(propertyKey, model);
        }
    });

    SCHEMA_REGISTER.setFieldType(schema, propertyKey, FieldType.INTEGER);
}
