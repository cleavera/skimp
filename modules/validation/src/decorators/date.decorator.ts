import { isBoolean, isDate, isNull, isSymbol } from '@cleavera/utils';
import { FieldCannotBeSymbolException, FieldType, ISchema, SCHEMA_REGISTER } from '@skimp/schema';
import { JsonPrimitive } from 'type-fest';

import { ValidationFieldInvalidDateException } from '../exceptions/validation-field-invalid-date.exception';

export const DateType: PropertyDecorator = (target: any, propertyKey: string | symbol): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const schema: ISchema = target.constructor;

    if (isSymbol(propertyKey)) {
        throw new FieldCannotBeSymbolException(propertyKey);
    }

    SCHEMA_REGISTER.addValidation(schema, (model: any): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!isDate(model[propertyKey]) && !isNull(model[propertyKey])) {
            throw new ValidationFieldInvalidDateException(propertyKey, model);
        }
    });

    SCHEMA_REGISTER.addSerialiser(schema, propertyKey, (deserialisedValue: Date | unknown | null): string | null => {
        if (isNull(deserialisedValue) || !isDate(deserialisedValue)) {
            return null;
        }

        return deserialisedValue.toISOString().split('T')[0];
    }, (serialisedValue: JsonPrimitive | null = null): Date | null => {
        if (isNull(serialisedValue) || serialisedValue === '') {
            return null;
        }

        if (isBoolean(serialisedValue)) {
            throw new ValidationFieldInvalidDateException(propertyKey, target);
        }

        const deserialisedValue: Date = new Date(serialisedValue);

        if (isNaN(deserialisedValue.valueOf()) || deserialisedValue.toISOString().split('T')[0] !== serialisedValue) {
            throw new ValidationFieldInvalidDateException(propertyKey, target);
        }

        return deserialisedValue;
    });

    SCHEMA_REGISTER.setFieldType(schema, propertyKey, FieldType.DATE);
};
