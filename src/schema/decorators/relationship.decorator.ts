import { SCHEMA_REGISTER } from '../constants/schema-register.constant';
import { ISchema } from '../interfaces/schema.interface';

export function Relationship(schema: ISchema, limit?: number): ClassDecorator {
    return (target: any): void => {
        SCHEMA_REGISTER.addSchemaRelationship(target.constructor, schema, limit);
    };
}
