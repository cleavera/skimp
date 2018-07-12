import { ISchema, SCHEMA_REGISTER } from '../../../schema/src/index';

import { ValidationFieldRequiredException } from '../exceptions/validation-field-required.exception';

export function Required(target: any, propertyKey: string): void {
    const schema: ISchema = target.constructor;

    SCHEMA_REGISTER.addValidation(schema, async(model: any) => {
        if ((!(propertyKey in model)) || model[propertyKey] === void 0 || model[propertyKey] === null) {
            throw new ValidationFieldRequiredException(propertyKey, model);
        }
    });

    SCHEMA_REGISTER.setFieldRequired(schema, propertyKey, true);
}
