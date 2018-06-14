import { SCHEMA_REGISTER } from '../../schema';

import { ValidationFieldRequiredException } from '../exceptions/validation-field-required.exception';

export function Required(target: any, propertyKey: string): void {
    SCHEMA_REGISTER.addValidation(target.constructor, async(model: any) => {
        if ((!(propertyKey in model)) || model[propertyKey] === void 0 || model[propertyKey] === null) {
            throw new ValidationFieldRequiredException(propertyKey, model);
        }
    });
}
