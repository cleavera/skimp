import { isEmpty, isNull } from '@cleavera/utils';
import { DB_REGISTER, MODEL_REGISTER, ResourceLocation } from '@skimp/core';

import { SCHEMA_REGISTER } from '../constants/schema-register.constant';
import { RelationshipCountExceedsLimitException } from '../exceptions/relationship-count-exceeds-limit.exception';
import { RelationshipDuplicateException } from '../exceptions/relationship-duplicate.exception';
import { RelationshipNotFoundException } from '../exceptions/relationship-not-found.exception';
import { ValidationExceptions } from '../exceptions/validation.exceptions';
import { ISchema } from '../interfaces/schema.interface';
import { IValidation } from '../interfaces/validation.interface';

export function Relationship(schema: ISchema, limit: number | null = null): ClassDecorator {
    return (target: any): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
        SCHEMA_REGISTER.addSchemaRelationship(target, schema);
        SCHEMA_REGISTER.addSchemaRelationship(schema, target);

        function RelationshipValidationFactory(other: ISchema, relationshipLimit: number | null = null): IValidation {
            return async(model: object): Promise<void> => {
                const allRelationships: Array<ResourceLocation> = MODEL_REGISTER.getRelationships(model);
                const relationships: Array<ResourceLocation> = allRelationships.filter((relationship: ResourceLocation) => {
                    return relationship.resourceName === SCHEMA_REGISTER.getSchemaResourceName(other);
                });

                const errors: ValidationExceptions = new ValidationExceptions();

                if (!isNull(relationshipLimit) && relationships.length > relationshipLimit) {
                    errors.push(new RelationshipCountExceedsLimitException(allRelationships.indexOf(relationships[relationships.length - 1])));
                }

                const matches: Record<string, boolean> = {};

                for (const relationship of relationships) {
                    if (!(await DB_REGISTER.get().exists(relationship))) {
                        errors.push(new RelationshipNotFoundException(allRelationships.indexOf(relationship)));
                    }

                    if (matches[relationship.toString()]) {
                        errors.push(new RelationshipDuplicateException(allRelationships.indexOf(relationship)));
                    }

                    matches[relationship.toString()] = true;
                }

                if (!isEmpty(errors)) {
                    throw errors; // eslint-disable-line @typescript-eslint/no-throw-literal
                }
            };
        }

        SCHEMA_REGISTER.addValidation(target, RelationshipValidationFactory(schema, limit));
        SCHEMA_REGISTER.addValidation(schema, RelationshipValidationFactory(target));
    };
}
