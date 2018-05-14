import { Location, MODEL_REGISTER } from '../../router';
import {
    IFieldMapping,
    ISchema, ResourceNotRegisteredException,
    SCHEMA_REGISTER,
    SchemaHasNoFieldsException,
    SchemaNotRegisteredException
} from '../../schema';
import { Url } from '../../server';
import { Nullable } from '../../shared';
import { IData } from '../interfaces/data.interface';
import { IJsonFile } from '../interfaces/json-file.interface';
import { IRelationship } from '../interfaces/relationship.interface';

export class Serialiser {
    public serialise(model: any): string {
        const schema: ISchema = model.constructor;
        const fields: Nullable<Array<IFieldMapping>> = SCHEMA_REGISTER.getFields(schema);
        const type: Nullable<string> = SCHEMA_REGISTER.getSchemaResourceName(schema);
        const relationships: Nullable<Array<Location>> = MODEL_REGISTER.getRelationships(model);

        if (!type) {
            throw new SchemaNotRegisteredException(schema);
        }

        if (!fields || !fields.length) {
            throw new SchemaHasNoFieldsException(schema);
        }

        const out: IJsonFile = {
            type,
            data: fields.reduce<IData>((result: IData, field: IFieldMapping): IData => {
                result[field.fieldName] = SCHEMA_REGISTER.serialise(schema, field.propertyName, model[field.propertyName]);

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
        const schema: Nullable<ISchema> = SCHEMA_REGISTER.getSchema(json.type);

        if (!schema) {
            throw new ResourceNotRegisteredException(json.type);
        }

        const fields: Nullable<Array<IFieldMapping>> = SCHEMA_REGISTER.getFields(schema);

        if (!fields || !fields.length) {
            throw new SchemaHasNoFieldsException(schema);
        }

        const model: any = new schema();

        fields.forEach((field: IFieldMapping) => {
            model[field.propertyName] = SCHEMA_REGISTER.deserialise(schema, field.propertyName, json.data[field.fieldName]);
        });

        if (json.relationships) {
            json.relationships.forEach((relationship: IRelationship) => {
                MODEL_REGISTER.addRelationship(model, Location.fromUrl(new Url(relationship)));
            });
        }

        return model;
    }
}
