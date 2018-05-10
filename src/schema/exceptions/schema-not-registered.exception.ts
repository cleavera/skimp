import { ISchema } from '../interfaces/schema.interface';

export class SchemaNotRegisteredException extends Error {
    constructor(schema: ISchema) {
        super(`${schema.constructor.name} has not been registered`);
    }
}
