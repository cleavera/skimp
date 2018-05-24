import { SCHEMA_REGISTER } from '../../schema';
import { Nullable } from '../../shared';
import { ValidationFieldInvalidDateException } from '../exceptions/validation-field-invalid-date.exception';

export function DateType(target: any, propertyKey: string): void {
    SCHEMA_REGISTER.addValidation(target.constructor, async(model: any) => {
        if (!(model[propertyKey] instanceof Date) && model[propertyKey] !== null) {
            throw new ValidationFieldInvalidDateException(propertyKey, model);
        }
    });

    SCHEMA_REGISTER.addSerialiser(target.constructor, propertyKey, (deserialisedValue: Nullable<Date>): Nullable<string> => {
        if (!deserialisedValue) {
            return;
        }

        return deserialisedValue.toISOString().split('T')[0];
    }, (serialisedValue: Nullable<string>): Nullable<Date> => {
        if (serialisedValue === undefined || serialisedValue === null || serialisedValue === '') {
            return null;
        }

        const deserialisedValue: Date = new Date(serialisedValue);

        if (isNaN(deserialisedValue.valueOf()) || deserialisedValue.toISOString().split('T')[0] !== serialisedValue) {
            throw new ValidationFieldInvalidDateException(propertyKey, target);
        }

        return deserialisedValue;
    });
}
