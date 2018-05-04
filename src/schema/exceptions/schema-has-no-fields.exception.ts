import { ISchema } from '..';

export class SchemaHasNoFieldsException extends Error {
    constructor(schema: ISchema) {
        super(`${schema.constructor.name} has no fields registered`);
    }
}
