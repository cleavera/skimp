import { ISchema } from '..';

export class SchemaNotRegisteredException extends Error {
    constructor(schema: ISchema) {
        super(`${schema.constructor.name} has not been registered`);
    }
}
