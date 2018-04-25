import { SCHEMA_REGISTER } from '..';

export function Field(alias?: string): PropertyDecorator {
    return (target: any, propertyKey: string): void => { // tslint:disable-line no-any
        if (!alias) {
            alias = propertyKey;
        }

        SCHEMA_REGISTER.addField(target.constructor, propertyKey, alias);
    };
}
