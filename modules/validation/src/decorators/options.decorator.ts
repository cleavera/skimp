import { IOptions, ISchema, SCHEMA_REGISTER } from '@skimp/schema';
import { IJsonValue } from '@skimp/shared';

import { ValidationFieldNotValidOptionException } from '../exceptions/validation-field-not-valid-option.exception';

export function Options<T extends IJsonValue>(options: IOptions<T>): PropertyDecorator {
    return (target: any, propertyKey: string): void => {
        const schema: ISchema = target.constructor;
        SCHEMA_REGISTER.addValidation(schema, async(model: any) => {
            const value: T = model[propertyKey];

            if (value !== null && options.indexOf(value) === -1) {
                throw new ValidationFieldNotValidOptionException(propertyKey, model);
            }
        });

        SCHEMA_REGISTER.setFieldOptions(schema, propertyKey, options);
    };
}
