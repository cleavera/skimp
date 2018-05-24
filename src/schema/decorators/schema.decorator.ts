import { Location, MODEL_REGISTER } from '../../router';
import { ValidationExceptions } from '../../validation';
import { SCHEMA_REGISTER } from '../constants/schema-register.constant';
import { RelationshipTypeNotAllowedException } from '../exceptions/relationship-type-not-allowed.exception';
import { IRelationshipDefinition } from '../interfaces/relationship-definition.interface';

export function Schema(resourceName: string): ClassDecorator {
    return (target: any): void => {
        SCHEMA_REGISTER.register(target, resourceName);

        SCHEMA_REGISTER.addValidation(target, async(model: any) => {
            const relationships: Array<Location> = MODEL_REGISTER.getRelationships(model);

            const allowedRelationships: Array<string> = (SCHEMA_REGISTER.getSchemaRelationships(target) || []).map((relationship: IRelationshipDefinition) => {
                return SCHEMA_REGISTER.getSchemaResourceName(relationship.schema) || '';
            });

            const errors: ValidationExceptions = new ValidationExceptions();

            for (const relationship of relationships) {
                if (allowedRelationships.indexOf(relationship.resourceName) === -1) {
                    errors.push(new RelationshipTypeNotAllowedException(relationships.indexOf(relationship)));
                }
            }

            if (errors.length) {
                throw errors;
            }
        });
    };
}
