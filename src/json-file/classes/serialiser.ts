import { Url } from '../../http';
import { FieldNotConfiguredException, ISchema, ResourceNotRegisteredException, SCHEMA_REGISTER, SchemaHasNoFieldsException, SchemaNotRegisteredException } from '../../schema';
import { Location, Maybe, MODEL_REGISTER } from '../../shared';

import { IData } from '../interfaces/data.interface';
import { IJsonFile } from '../interfaces/json-file.interface';
import { IRelationship } from '../interfaces/relationship.interface';

export class Serialiser {
    public serialise(model: any): string {
        const schema: ISchema = model.constructor;
        const fields: Maybe<Array<string>> = SCHEMA_REGISTER.getFields(schema);
        const type: Maybe<string> = SCHEMA_REGISTER.getSchemaResourceName(schema);
        const relationships: Maybe<Array<Location>> = MODEL_REGISTER.getRelationships(model);

        if (!type) {
            throw new SchemaNotRegisteredException(schema);
        }

        if (!fields || !fields.length) {
            throw new SchemaHasNoFieldsException(schema);
        }

        const out: IJsonFile = {
            type,
            data: fields.reduce<IData>((result: IData, field: string): IData => {
                const mappedField: Maybe<string> = SCHEMA_REGISTER.mapToField(schema, field);

                if (!mappedField) {
                    throw new FieldNotConfiguredException(schema, field);
                }

                result[mappedField] = SCHEMA_REGISTER.serialise(schema, field, model[field]);

                return result;
            }, {}),
            relationships: relationships && relationships.length ? relationships.map((relationship: Location): IRelationship => {
                return relationship.toString();
            }) : undefined
        };

        return JSON.stringify(out, null, '\t');
    }

    public deserialise(body: string): any {
        const json: IJsonFile = JSON.parse(body);
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(json.type);

        if (!schema) {
            throw new ResourceNotRegisteredException(json.type);
        }

        const fields: Maybe<Array<string>> = SCHEMA_REGISTER.getFields(schema);

        if (!fields || !fields.length) {
            throw new SchemaHasNoFieldsException(schema);
        }

        const model: any = new schema();

        fields.forEach((field: string) => {
            const mappedField: Maybe<string> = SCHEMA_REGISTER.mapToField(schema, field);

            if (!mappedField) {
                throw new FieldNotConfiguredException(schema, field);
            }

            model[field] = SCHEMA_REGISTER.deserialise(schema, field, json.data[mappedField]);
        });

        if (json.relationships) {
            json.relationships.forEach((relationship: IRelationship) => {
                MODEL_REGISTER.addRelationship(model, Location.fromUrl(new Url(relationship)));
            });
        }

        return model;
    }
}
