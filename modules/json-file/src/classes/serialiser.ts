import { $isEmpty, $isNull, $isUndefined, Maybe } from '@cleavera/utils';
import { MODEL_REGISTER, ResourceLocation } from '@skimp/core';
import { FieldNotConfiguredException, ISchema, ResourceNotRegisteredException, SCHEMA_REGISTER, SchemaNotRegisteredException } from '@skimp/schema';

import { IData } from '../interfaces/data.interface';
import { IJsonFile } from '../interfaces/json-file.interface';
import { IRelationship } from '../interfaces/relationship.interface';

export class Serialiser {
    public serialise(model: any): string { // eslint-disable-line
        const schema: ISchema = model.constructor;
        let fields: Maybe<Array<string>> = SCHEMA_REGISTER.getFields(schema);
        const type: Maybe<string> = SCHEMA_REGISTER.getSchemaResourceName(schema);
        const relationships: Maybe<Array<ResourceLocation>> = MODEL_REGISTER.getRelationships(model);

        if ($isNull(type)) {
            throw new SchemaNotRegisteredException(schema);
        }

        if ($isNull(fields)) {
            fields = [];
        }

        const out: IJsonFile = {
            type,
            data: fields.reduce<IData>((result: IData, field: string): IData => {
                const mappedField: Maybe<string> = SCHEMA_REGISTER.mapToField(schema, field);

                if ($isNull(mappedField)) {
                    throw new FieldNotConfiguredException(schema, field);
                }

                result[mappedField] = SCHEMA_REGISTER.serialise(schema, field, model[field]) as string;

                return result;
            }, {})
        };

        if (!$isEmpty(relationships ?? [])) {
            out.relationships = relationships.map((relationship: ResourceLocation): IRelationship => {
                return relationship.toString();
            });
        }

        return JSON.stringify(out, null, '\t');
    }

    public deserialise(body: string): object {
        const json: IJsonFile = JSON.parse(body);
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(json.type);

        if ($isNull(schema)) {
            throw new ResourceNotRegisteredException(json.type);
        }

        let fields: Maybe<Array<string>> = SCHEMA_REGISTER.getFields(schema);

        if ($isNull(fields)) {
            fields = [];
        }

        const model: any = new schema(); // eslint-disable-line

        fields.forEach((field: string) => {
            const mappedField: Maybe<string> = SCHEMA_REGISTER.mapToField(schema, field);

            if ($isNull(mappedField)) {
                throw new FieldNotConfiguredException(schema, field);
            }

            model[field] = SCHEMA_REGISTER.deserialise(schema, field, json.data[mappedField]);
        });

        if (!$isUndefined(json.relationships)) {
            json.relationships.forEach((relationship: IRelationship) => {
                MODEL_REGISTER.addRelationship(model, ResourceLocation.FromString(relationship));
            });
        }

        return model;
    }
}
