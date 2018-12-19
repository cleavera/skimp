import { $isNull, $isSymbol, IJsonValue } from '@cleavera/utils';
import { FieldCannotBeSymbolException, IOptions, ISchema, SCHEMA_REGISTER } from '@skimp/schema';

import { ValidationFieldNotValidOptionException } from '../exceptions/validation-field-not-valid-option.exception';

export function Options<T extends IJsonValue>(options: IOptions<T>): PropertyDecorator {
    return (target: any, propertyKey: string | symbol): void => {
        const schema: ISchema = target.constructor;

        if ($isSymbol(propertyKey)) {
            throw new FieldCannotBeSymbolException(propertyKey);
        }

        SCHEMA_REGISTER.addValidation(schema, async(model: any) => {
            const value: T = model[propertyKey];

            if (!$isNull(value) && options.indexOf(value) === -1) {
                throw new ValidationFieldNotValidOptionException(propertyKey, model);
            }
        });

        SCHEMA_REGISTER.setFieldOptions(schema, propertyKey, options);
    };
}
