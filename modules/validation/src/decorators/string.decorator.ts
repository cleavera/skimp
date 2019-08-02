import { $isNull, $isString, $isSymbol } from '@cleavera/utils';
import { FieldCannotBeSymbolException, FieldType, ISchema, SCHEMA_REGISTER } from '@skimp/schema';

import { ValidationFieldInvalidStringException } from '../exceptions/validation-field-invalid-string.exception';

export const StringType: PropertyDecorator = (target: any, propertyKey: string | symbol): void => { // tslint:disable-line no-any
    const schema: ISchema = target.constructor;

    if ($isSymbol(propertyKey)) {
        throw new FieldCannotBeSymbolException(propertyKey);
    }

    SCHEMA_REGISTER.addValidation(schema, async(model: any) => { // tslint:disable-line no-any
        if (!$isString(model[propertyKey]) && !$isNull(model[propertyKey])) {
            throw new ValidationFieldInvalidStringException(propertyKey, model);
        }
    });

    SCHEMA_REGISTER.setFieldType(schema, propertyKey, FieldType.STRING);
};
