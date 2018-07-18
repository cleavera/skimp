import { FieldCannotBeSymbolException, FieldType, ISchema, SCHEMA_REGISTER } from '@skimp/schema';
import { $isBoolean, $isNull, $isSymbol } from '@skimp/shared';

import { ValidationFieldInvalidBooleanException } from '../exceptions/validation-field-invalid-boolean.exception';

export const BooleanType: PropertyDecorator = (target: any, propertyKey: string | symbol): void => {
    if ($isSymbol(propertyKey)) {
        throw new FieldCannotBeSymbolException(propertyKey);
    }

    const schema: ISchema = target.constructor;

    SCHEMA_REGISTER.addValidation(schema, async(model: any) => {
        if (!$isBoolean(model[propertyKey]) && !$isNull(model[propertyKey])) {
            throw new ValidationFieldInvalidBooleanException(propertyKey, model);
        }
    });

    SCHEMA_REGISTER.setFieldType(schema, propertyKey, FieldType.BOOLEAN);
};
