import { $isEmpty } from '@cleavera/utils';
import { MODEL_REGISTER, ResourceLocation } from '@skimp/core';

import { SCHEMA_REGISTER } from '../constants/schema-register.constant';
import { RelationshipTypeNotAllowedException } from '../exceptions/relationship-type-not-allowed.exception';
import { ValidationExceptions } from '../exceptions/validation.exceptions';
import { ISchema } from '../interfaces/schema.interface';

export function Schema(resourceName: string): ClassDecorator {
    return (target: any): void => { // eslint-disable-line
        SCHEMA_REGISTER.register(target, resourceName);

        SCHEMA_REGISTER.addValidation(target, (model: object) => {
            const relationships: Array<ResourceLocation> = MODEL_REGISTER.getRelationships(model);

            const allowedRelationships: Array<string> = (SCHEMA_REGISTER.getSchemaRelationships(target) ?? []).map((relationship: ISchema) => {
                return SCHEMA_REGISTER.getSchemaResourceName(relationship) ?? '';
            });

            const errors: ValidationExceptions = new ValidationExceptions();

            for (const relationship of relationships) {
                if (!allowedRelationships.includes(relationship.resourceName)) {
                    errors.push(new RelationshipTypeNotAllowedException(relationships.indexOf(relationship)));
                }
            }

            if (!$isEmpty(errors)) {
                throw errors; // eslint-disable-line @typescript-eslint/no-throw-literal
            }
        });
    };
}
