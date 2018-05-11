import { SCHEMA_REGISTER } from '../constants/schema-register.constant';
import { ValidationFieldRequiredException } from '../exceptions/validation-field-required.exception';

export function Required(target: any, propertyKey: string): void {
    SCHEMA_REGISTER.addValidation(target.constructor, (model: any) => {
        if ((!(propertyKey in model)) || model[propertyKey] === void 0 || model[propertyKey] === null || model[propertyKey] === '') {
            throw new ValidationFieldRequiredException(propertyKey, model);
        }
    });
}
