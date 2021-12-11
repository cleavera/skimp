import { ISchema } from '../interfaces/schema.interface';

export class FieldNotConfiguredException extends Error {
    constructor(schema: ISchema, fieldName: string) {
        super(`${fieldName} has not been configured on ${schema.constructor.name}`);
    }
}
