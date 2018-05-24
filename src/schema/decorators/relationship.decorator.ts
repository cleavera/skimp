import { DB_REGISTER, Location, MODEL_REGISTER } from '../../router';
import { ValidationExceptions } from '../../validation';
import { SCHEMA_REGISTER } from '../constants/schema-register.constant';
import { RelationshipNotFoundException } from '../exceptions/relationship-not-found.exception';
import { ISchema } from '../interfaces/schema.interface';

export function Relationship(schema: ISchema, limit?: number): ClassDecorator {
    return (target: any): void => {
        SCHEMA_REGISTER.addSchemaRelationship(target, schema, limit);

        SCHEMA_REGISTER.addValidation(target, async(model: any) => {
            const relationships: Array<Location> = MODEL_REGISTER.getRelationships(model);

            const errors: ValidationExceptions = new ValidationExceptions();

            for (const relationship of relationships) {
                if (!(await DB_REGISTER.get().exists(relationship))) {
                    errors.push(new RelationshipNotFoundException(relationships.indexOf(relationship)));
                }
            }

            if (errors.length) {
                throw errors;
            }
        });
    };
}
