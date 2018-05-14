import { Location, MODEL_REGISTER, ValidationExceptions } from '../../router';
import { SCHEMA_REGISTER } from '../constants/schema-register.constant';
import { RelationshipTypeNotAllowedException } from '../exceptions/relationship-type-not-allowed.exception';
import { IRelationshipDefinition } from '../interfaces/relationship-definition.interface';
import { ISchema } from '../interfaces/schema.interface';

export function Relationship(schema: ISchema, limit?: number): ClassDecorator {
    return (target: any): void => {
        SCHEMA_REGISTER.addSchemaRelationship(target, schema, limit);

        SCHEMA_REGISTER.addValidation(target, (model: any) => {
            const relationships: Array<Location> = MODEL_REGISTER.getRelationships(model);

            const allowedRelationships: Array<string> = (SCHEMA_REGISTER.getSchemaRelationships(target) || []).map((relationship: IRelationshipDefinition) => {
                return SCHEMA_REGISTER.getSchemaResourceName(relationship.schema) || '';
            });

            const errors: ValidationExceptions = new ValidationExceptions();

            relationships.forEach((relationship: Location, index: number): void => {
                if (allowedRelationships.indexOf(relationship.resourceName) === -1) {
                    errors.push(new RelationshipTypeNotAllowedException(index));
                }
            });

            if (errors.length) {
                throw errors;
            }
        });
    };
}
