import { SCHEMA_REGISTER } from '..';

export function Schema(resourceName: string): ClassDecorator {
    return (target: any): void => { // tslint:disable-line no-any
        const schemaId: string = SCHEMA_REGISTER.register(target);

        SCHEMA_REGISTER.addMeta(schemaId, 'resourceName', resourceName);
    };
}
