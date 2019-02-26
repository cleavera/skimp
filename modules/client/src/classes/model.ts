import { $isNull, Maybe } from '@cleavera/utils';
import { MODEL_REGISTER, ResourceLocation } from '@skimp/core';
import { ISchema, SCHEMA_REGISTER, SchemaNotRegisteredException } from '@skimp/schema';

export class Model {
    public static getLocation(model: unknown): Maybe<ResourceLocation> {
        return MODEL_REGISTER.getLocation(model);
    }

    public static getRelationships(model: unknown): Maybe<Array<ResourceLocation>> {
        return MODEL_REGISTER.getRelationships(model);
    }

    public static getRelationshipOfType(model: unknown, relatedSchema: ISchema): Maybe<Array<ResourceLocation>> {
        const relationships: Maybe<Array<ResourceLocation>> = this.getRelationships(model);
        const resourceName: Maybe<string> = SCHEMA_REGISTER.getSchemaResourceName(relatedSchema);

        if ($isNull(resourceName)) {
            throw new SchemaNotRegisteredException(relatedSchema);
        }

        if ($isNull(relationships)) {
            return null;
        }

        return relationships.filter((relationship: ResourceLocation) => {
            return relationship.resourceName === resourceName;
        }) || null;
    }
}
