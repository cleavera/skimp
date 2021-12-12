import { isNull } from '@cleavera/utils';
import { MODEL_REGISTER, ResourceLocation } from '@skimp/core';
import { NoLocationRegisteredException } from '@skimp/router';
import { ISchema, SCHEMA_REGISTER, SchemaNotRegisteredException } from '@skimp/schema';

export class Model {
    public static getLocation(model: object): ResourceLocation | null {
        return MODEL_REGISTER.getLocation(model);
    }

    public static getRelationships(model: object): Array<ResourceLocation> | null {
        return MODEL_REGISTER.getRelationships(model);
    }

    public static getRelationshipOfType(model: object, relatedSchema: ISchema): Array<ResourceLocation> | null {
        const relationships: Array<ResourceLocation> | null = this.getRelationships(model);
        const resourceName: string | null = SCHEMA_REGISTER.getSchemaResourceName(relatedSchema);

        if (isNull(resourceName)) {
            throw new SchemaNotRegisteredException(relatedSchema);
        }

        if (isNull(relationships)) {
            return null;
        }

        return relationships.filter((relationship: ResourceLocation) => {
            return relationship.resourceName === resourceName;
        }) ?? null;
    }

    public static addRelationship(model1: object, model2: object): void {
        const location: ResourceLocation | null = this.getLocation(model2);

        if (isNull(location)) {
            throw new NoLocationRegisteredException(model2);
        }

        MODEL_REGISTER.addRelationship(model1, location);
    }
}
