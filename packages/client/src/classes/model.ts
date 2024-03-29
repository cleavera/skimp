import { isNull } from '@cleavera/utils';
import { MODEL_REGISTER, ResourceLocation } from '@skimp/core';
import { Serialiser } from '@skimp/json-api';
import { NoLocationRegisteredException } from '@skimp/router';
import { ISchema, SCHEMA_REGISTER, SchemaNotRegisteredException } from '@skimp/schema';

export class Model {
    public static clone<T extends object>(model: T): T {
        const serialiser: Serialiser = new Serialiser();
        const location: ResourceLocation | null = MODEL_REGISTER.getLocation(model);
        const clonedModel: T = serialiser.deserialise(JSON.parse(serialiser.serialiseModel(model))) as T;

        if (location !== null) {
            MODEL_REGISTER.setLocation(clonedModel, location);
        }

        return clonedModel;
    }

    public static getLocation(model: object): ResourceLocation | null {
        return MODEL_REGISTER.getLocation(model);
    }

    public static setLocation(model: object, location: ResourceLocation): void {
        MODEL_REGISTER.setLocation(model, location);
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

        const relationships: Array<ResourceLocation> = this.getRelationships(model1) ?? [];

        for (const relationship of relationships) {
            if (relationship.toString() === location.toString()) {
                return;
            }
        }

        MODEL_REGISTER.addRelationship(model1, location);
    }

    public static removeRelationship(model1: object, model2: object | ResourceLocation): void {
        let location: ResourceLocation | null = null;

        if (model2 instanceof ResourceLocation) {
            location = model2;
        } else {
            location = this.getLocation(model2);
        }

        if (isNull(location)) {
            throw new NoLocationRegisteredException(model2);
        }

        MODEL_REGISTER.removeRelationship(model1, location);
    }
}
