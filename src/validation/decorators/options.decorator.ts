import { SCHEMA_REGISTER } from '../../schema';
import { IJsonValue } from '../../shared';
import { ValidationFieldNotValidOptionException } from '../exceptions/validation-field-not-valid-option.exception';
import { IOptions } from '../interfaces/options.interface';

export function Options<T extends IJsonValue>(options: IOptions<T>): PropertyDecorator {
    return (target: any, propertyKey: string): void => {
        SCHEMA_REGISTER.addValidation(target.constructor, async(model: any) => {
            const value: T = model[propertyKey];

            if (value && options.indexOf(value) === -1) {
                throw new ValidationFieldNotValidOptionException(propertyKey, model);
            }
        });
    };
}
