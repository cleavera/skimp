import { isNull, isSymbol, isUndefined } from '@cleavera/utils';
import { FieldCannotBeSymbolException, ISchema, SCHEMA_REGISTER } from '@skimp/schema';

import { ValidationFieldRequiredException } from '../exceptions/validation-field-required.exception';

export const Required: PropertyDecorator = (target: any, propertyKey: string | symbol): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const schema: ISchema = target.constructor;

    if (isSymbol(propertyKey)) {
        throw new FieldCannotBeSymbolException(propertyKey);
    }

    SCHEMA_REGISTER.addValidation(schema, (model: any): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if ((!(propertyKey in model)) || isUndefined(model[propertyKey]) || isNull(model[propertyKey])) {
            throw new ValidationFieldRequiredException(propertyKey, model);
        }
    });

    SCHEMA_REGISTER.setFieldRequired(schema, propertyKey, true);
};
