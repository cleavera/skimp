import { Maybe } from '../../../core/src/index';
import { FieldType, ISchema, SCHEMA_REGISTER } from '../../../schema/src/index';

import { ValidationFieldInvalidDateException } from '../exceptions/validation-field-invalid-date.exception';

export function DateType(target: any, propertyKey: string): void {
    const schema: ISchema = target.constructor;

    SCHEMA_REGISTER.addValidation(schema, async(model: any) => {
        if (!(model[propertyKey] instanceof Date) && model[propertyKey] !== null) {
            throw new ValidationFieldInvalidDateException(propertyKey, model);
        }
    });

    SCHEMA_REGISTER.addSerialiser(schema, propertyKey, (deserialisedValue: Maybe<Date>): Maybe<string> => {
        if (!deserialisedValue) {
            return null;
        }

        return deserialisedValue.toISOString().split('T')[0];
    }, (serialisedValue: Maybe<string> = null): Maybe<Date> | null => {
        if (serialisedValue === null || serialisedValue === '') {
            return null;
        }

        const deserialisedValue: Date = new Date(serialisedValue);

        if (isNaN(deserialisedValue.valueOf()) || deserialisedValue.toISOString().split('T')[0] !== serialisedValue) {
            throw new ValidationFieldInvalidDateException(propertyKey, target);
        }

        return deserialisedValue;
    });

    SCHEMA_REGISTER.setFieldType(schema, propertyKey, FieldType.DATE);
}
