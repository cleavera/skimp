import { $isNull, $isNumber, $isSymbol } from '@cleavera/utils';
import { FieldCannotBeSymbolException, FieldType, ISchema, SCHEMA_REGISTER } from '@skimp/schema';

import { ValidationFieldInvalidIntegerException } from '../exceptions/validation-field-invalid-integer.exception';

export const IntegerType: PropertyDecorator = (target: any, propertyKey: string | symbol): void => {
    if ($isSymbol(propertyKey)) {
        throw new FieldCannotBeSymbolException(propertyKey);
    }

    const schema: ISchema = target.constructor;

    SCHEMA_REGISTER.addValidation(schema, async(model: any) => {
        if ((!$isNumber(model[propertyKey]) || !Number.isInteger(model[propertyKey])) && !$isNull(model[propertyKey])) {
            throw new ValidationFieldInvalidIntegerException(propertyKey, model);
        }
    });

    SCHEMA_REGISTER.setFieldType(schema, propertyKey, FieldType.INTEGER);
};
