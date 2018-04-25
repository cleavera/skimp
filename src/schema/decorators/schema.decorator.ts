import { SCHEMA_REGISTER } from '..';

export function Schema(resourceName: string): ClassDecorator {
    return (target: any): void => { // tslint:disable-line no-any
        SCHEMA_REGISTER.register(target, resourceName);
    };
}
