import { ISchema } from '../interfaces/schema.interface';

export class SchemaHasNoFieldsException extends Error {
    constructor(schema: ISchema) {
        super(`${schema.constructor.name} has no fields registered`);
    }
}
