import { isNull, isSymbol } from '@cleavera/utils';
import { FieldCannotBeSymbolException, IOptions, ISchema, SCHEMA_REGISTER } from '@skimp/schema';
import { JsonPrimitive } from 'type-fest';

import { ValidationFieldNotValidOptionException } from '../exceptions/validation-field-not-valid-option.exception';

export function Options<T extends JsonPrimitive>(options: IOptions<T>): PropertyDecorator {
    return (target: any, propertyKey: string | symbol): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const schema: ISchema = target.constructor;

        if (isSymbol(propertyKey)) {
            throw new FieldCannotBeSymbolException(propertyKey);
        }

        SCHEMA_REGISTER.addValidation(schema, (model: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            const value: T = model[propertyKey];

            if (!isNull(value) && !options.includes(value)) {
                throw new ValidationFieldNotValidOptionException(propertyKey, model);
            }
        });

        SCHEMA_REGISTER.setFieldOptions(schema, propertyKey, options);
    };
}
