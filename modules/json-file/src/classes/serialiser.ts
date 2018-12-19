import { $isNull, Maybe } from '@cleavera/utils';
import { MODEL_REGISTER, ResourceLocation } from '@skimp/core';
import { Uri } from '@skimp/http';
import { FieldNotConfiguredException, ISchema, ResourceNotRegisteredException, SCHEMA_REGISTER, SchemaHasNoFieldsException, SchemaNotRegisteredException } from '@skimp/schema';

import { IData } from '../interfaces/data.interface';
import { IJsonFile } from '../interfaces/json-file.interface';
import { IRelationship } from '../interfaces/relationship.interface';

export class Serialiser {
    public serialise(model: any): string {
        const schema: ISchema = model.constructor;
        const fields: Maybe<Array<string>> = SCHEMA_REGISTER.getFields(schema);
        const type: Maybe<string> = SCHEMA_REGISTER.getSchemaResourceName(schema);
        const relationships: Maybe<Array<ResourceLocation>> = MODEL_REGISTER.getRelationships(model);

        if ($isNull(type)) {
            throw new SchemaNotRegisteredException(schema);
        }

        if ($isNull(fields) || !fields.length) {
            throw new SchemaHasNoFieldsException(schema);
        }

        const out: IJsonFile = {
            type,
            data: fields.reduce<IData>((result: IData, field: string): IData => {
                const mappedField: Maybe<string> = SCHEMA_REGISTER.mapToField(schema, field);

                if ($isNull(mappedField)) {
                    throw new FieldNotConfiguredException(schema, field);
                }

                result[mappedField] = SCHEMA_REGISTER.serialise(schema, field, model[field]);

                return result;
            }, {}),
            relationships: relationships && relationships.length ? relationships.map((relationship: ResourceLocation): IRelationship => {
                return relationship.toString();
            }) : undefined
        };

        return JSON.stringify(out, null, '\t');
    }

    public deserialise(body: string): any {
        const json: IJsonFile = JSON.parse(body);
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(json.type);

        if ($isNull(schema)) {
            throw new ResourceNotRegisteredException(json.type);
        }

        const fields: Maybe<Array<string>> = SCHEMA_REGISTER.getFields(schema);

        if ($isNull(fields) || !fields.length) {
            throw new SchemaHasNoFieldsException(schema);
        }

        const model: any = new schema();

        fields.forEach((field: string) => {
            const mappedField: Maybe<string> = SCHEMA_REGISTER.mapToField(schema, field);

            if ($isNull(mappedField)) {
                throw new FieldNotConfiguredException(schema, field);
            }

            model[field] = SCHEMA_REGISTER.deserialise(schema, field, json.data[mappedField]);
        });

        if (json.relationships) {
            json.relationships.forEach((relationship: IRelationship) => {
                MODEL_REGISTER.addRelationship(model, ResourceLocation.fromUrl(new Uri(relationship)));
            });
        }

        return model;
    }
}
