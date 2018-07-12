import { MODEL_REGISTER, ResourceLocation } from '../../../core/src/index';

import { SCHEMA_REGISTER } from '../constants/schema-register.constant';
import { RelationshipTypeNotAllowedException } from '../exceptions/relationship-type-not-allowed.exception';
import { ValidationExceptions } from '../exceptions/validation.exceptions';
import { ISchema } from '../interfaces/schema.interface';

export function Schema(resourceName: string): ClassDecorator {
    return (target: any): void => {
        SCHEMA_REGISTER.register(target, resourceName);

        SCHEMA_REGISTER.addValidation(target, async(model: any) => {
            const relationships: Array<ResourceLocation> = MODEL_REGISTER.getRelationships(model);

            const allowedRelationships: Array<string> = (SCHEMA_REGISTER.getSchemaRelationships(target) || []).map((relationship: ISchema) => {
                return SCHEMA_REGISTER.getSchemaResourceName(relationship) || '';
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
