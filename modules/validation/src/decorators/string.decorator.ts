import { FieldCannotBeSymbolException, FieldType, ISchema, SCHEMA_REGISTER } from '@skimp/schema';
import { $isNull, $isString, $isSymbol } from '@skimp/shared';

import { ValidationFieldInvalidStringException } from '../exceptions/validation-field-invalid-string.exception';

export const StringType: PropertyDecorator = (target: any, propertyKey: string | symbol): void => {
    const schema: ISchema = target.constructor;

    if ($isSymbol(propertyKey)) {
        throw new FieldCannotBeSymbolException(propertyKey);
    }

    SCHEMA_REGISTER.addValidation(schema, async(model: any) => {
        if (!$isString(model[propertyKey]) && !$isNull(model[propertyKey])) {
            throw new ValidationFieldInvalidStringException(propertyKey, model);
        }
    });

    SCHEMA_REGISTER.setFieldType(schema, propertyKey, FieldType.STRING);
};
