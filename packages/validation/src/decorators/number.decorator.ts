import { isNull, isNumber, isSymbol } from '@cleavera/utils';
import { FieldCannotBeSymbolException, FieldType, ISchema, SCHEMA_REGISTER } from '@skimp/schema';

import { ValidationFieldInvalidNumberException } from '../exceptions/validation-field-invalid-number.exception';

export const NumberType: PropertyDecorator = (target: any, propertyKey: string | symbol): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const schema: ISchema = target.constructor;

    if (isSymbol(propertyKey)) {
        throw new FieldCannotBeSymbolException(propertyKey);
    }

    SCHEMA_REGISTER.addValidation(schema, (model: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!isNumber(model[propertyKey]) && !isNull(model[propertyKey])) {
            throw new ValidationFieldInvalidNumberException(propertyKey, model);
        }
    });

    SCHEMA_REGISTER.setFieldType(schema, propertyKey, FieldType.NUMBER);
};
