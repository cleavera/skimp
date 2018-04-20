import { ISchema } from '..';

export class SchemaRegistrationException extends Error {
    constructor(schema: ISchema) {
        super(`${schema.constructor.name} not registered properly`);
    }
}
