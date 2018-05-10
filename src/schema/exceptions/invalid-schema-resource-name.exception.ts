import { ISchema } from '../interfaces/schema.interface';

export class InvalidSchemaResourceNameException extends Error {
    constructor(schema: ISchema) {
        super(`${schema.constructor.name} does not have a valid resource name`);
    }
}