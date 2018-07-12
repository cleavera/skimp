import { FieldType, ISchema, SCHEMA_REGISTER } from '../../../schema/src/index';

import { ValidationFieldInvalidBooleanException } from '../exceptions/validation-field-invalid-boolean.exception';

export function Boolean(target: any, propertyKey: string): void {
    const schema: ISchema = target.constructor;

    SCHEMA_REGISTER.addValidation(schema, async(model: any) => {
        if (typeof model[propertyKey] !== 'boolean' && model[propertyKey] !== null) {
            throw new ValidationFieldInvalidBooleanException(propertyKey, model);
        }
    });

    SCHEMA_REGISTER.setFieldType(schema, propertyKey, FieldType.BOOLEAN);
}
