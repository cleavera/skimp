import { isBoolean, isNull, isSymbol } from '@cleavera/utils';
import { FieldCannotBeSymbolException, FieldType, ISchema, SCHEMA_REGISTER } from '@skimp/schema';

import { ValidationFieldInvalidBooleanException } from '../exceptions/validation-field-invalid-boolean.exception';

export const BooleanType: PropertyDecorator = (target: any, propertyKey: string | symbol): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (isSymbol(propertyKey)) {
        throw new FieldCannotBeSymbolException(propertyKey);
    }

    const schema: ISchema = target.constructor;

    SCHEMA_REGISTER.addValidation(schema, (model: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!isBoolean(model[propertyKey]) && !isNull(model[propertyKey])) {
            throw new ValidationFieldInvalidBooleanException(propertyKey, model);
        }
    });

    SCHEMA_REGISTER.setFieldType(schema, propertyKey, FieldType.BOOLEAN);
};
