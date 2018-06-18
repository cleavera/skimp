import { SCHEMA_REGISTER } from '../constants/schema-register.constant';

export function Field(alias?: string): PropertyDecorator {
    return (target: any, propertyKey: string): void => { // tslint:disable-line no-any
        if (!alias) {
            alias = propertyKey;
        }

        SCHEMA_REGISTER.addFieldMapping(target.constructor, propertyKey, alias);
    };
}
