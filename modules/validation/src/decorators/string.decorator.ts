import { FieldType, ISchema, SCHEMA_REGISTER } from '@skimp/schema';

import { ValidationFieldInvalidStringException } from '../exceptions/validation-field-invalid-string.exception';

export function String(target: any, propertyKey: string): void {
    const schema: ISchema = target.constructor;

    SCHEMA_REGISTER.addValidation(schema, async(model: any) => {
        if (typeof model[propertyKey] !== 'string' && model[propertyKey] !== null) {
            throw new ValidationFieldInvalidStringException(propertyKey, model);
        }
    });

    SCHEMA_REGISTER.setFieldType(schema, propertyKey, FieldType.STRING);
}
