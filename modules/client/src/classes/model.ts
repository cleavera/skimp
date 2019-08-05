import { $isNull, Maybe } from '@cleavera/utils';
import { MODEL_REGISTER, ResourceLocation } from '@skimp/core';
import { NoLocationRegisteredException } from '@skimp/router';
import { ISchema, SCHEMA_REGISTER, SchemaNotRegisteredException } from '@skimp/schema';

export class Model {
    public static getLocation(model: object): Maybe<ResourceLocation> {
        return MODEL_REGISTER.getLocation(model);
    }

    public static getRelationships(model: object): Maybe<Array<ResourceLocation>> {
        return MODEL_REGISTER.getRelationships(model);
    }

    public static getRelationshipOfType(model: object, relatedSchema: ISchema): Maybe<Array<ResourceLocation>> {
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

    public static addRelationship(model1: object, model2: object): void {
        const location: Maybe<ResourceLocation> = this.getLocation(model2);

        if ($isNull(location)) {
            throw new NoLocationRegisteredException(model2);
        }

        MODEL_REGISTER.addRelationship(model1, location);
    }
}
