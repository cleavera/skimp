import { DB_REGISTER, MODEL_REGISTER, ResourceLocation } from '@skimp/core';

import { SCHEMA_REGISTER } from '../constants/schema-register.constant';
import { RelationshipCountExceedsLimitException } from '../exceptions/relationship-count-exceeds-limit.exception';
import { RelationshipNotFoundException } from '../exceptions/relationship-not-found.exception';
import { ValidationExceptions } from '../exceptions/validation.exceptions';
import { ISchema } from '../interfaces/schema.interface';

export function Relationship(schema: ISchema, limit?: number): ClassDecorator {
    return (target: any): void => {
        SCHEMA_REGISTER.addSchemaRelationship(target, schema);
        SCHEMA_REGISTER.addSchemaRelationship(schema, target);

        SCHEMA_REGISTER.addValidation(target, async(model: any) => {
            const allRelationships: Array<ResourceLocation> = MODEL_REGISTER.getRelationships(model);
            const relationships: Array<ResourceLocation> = allRelationships.filter((relationship: ResourceLocation) => {
                return relationship.resourceName === SCHEMA_REGISTER.getSchemaResourceName(schema);
            });

            const errors: ValidationExceptions = new ValidationExceptions();

            if (limit && relationships.length > limit) {
                errors.push(new RelationshipCountExceedsLimitException(allRelationships.indexOf(relationships[relationships.length - 1])));
            }

            for (const relationship of relationships) {
                if (!(await DB_REGISTER.get().exists(relationship))) {
                    errors.push(new RelationshipNotFoundException(allRelationships.indexOf(relationship)));
                }
            }

            if (errors.length) {
                throw errors;
            }
        });
    };
}