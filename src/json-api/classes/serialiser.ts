import { Location, MODEL_REGISTER } from '../../router';
import {
    IFieldMapping,
    ISchema,
    ModelPointer, RelationshipPointer, RelationshipValidationException,
    ResourceNotRegisteredException,
    SCHEMA_REGISTER,
    SchemaHasNoFieldsException,
    SchemaNotRegisteredException
} from '../../schema';
import { Url } from '../../server';
import { Nullable } from '../../shared';
import { ModelValidationException, ValidationException } from '../../validation';
import { InvalidJSONRelationship } from '../exception/invalid-json-relationship.exception';
import { IAttributes } from '../interfaces/attributes.interface';
import { IJsonData } from '../interfaces/json-data.interface';
import { IJsonError } from '../interfaces/json-error.interface';
import { IJsonErrors } from '../interfaces/json-errors.interface';
import { ILinks } from '../interfaces/links.interface';
import { IRelationship } from '../interfaces/relationship.interface';

export class Serialiser {
    public error(errors: Array<ValidationException>): IJsonErrors {
        return {
            errors: errors.reduce((acc: Array<IJsonError>, exception: ValidationException) => {
                if (exception instanceof ModelValidationException) {
                    return acc.concat((exception.fields).map((pointer: ModelPointer): IJsonError => {
                        return {
                            code: exception.code,
                            source: {
                                pointer: pointer ? `/data/attributes/${pointer.field}` : ''
                            }
                        };
                    }));
                } else if (exception instanceof RelationshipValidationException) {
                    return acc.concat((exception.relationships).map((pointer: RelationshipPointer): IJsonError => {
                        return {
                            code: exception.code,
                            source: {
                                pointer: pointer ? `/data/relationships/${pointer}` : ''
                            }
                        };
                    }));
                } else {
                    acc.push({
                        code: exception.code,
                        source: {
                            pointer: ''
                        }
                    });

                    return acc;
                }
            }, [])
        };
    }

    public serialise(model: any, location: Location): IJsonData {
        const schema: ISchema = model.constructor;
        const fields: Nullable<Array<IFieldMapping>> = SCHEMA_REGISTER.getFields(schema);
        const type: Nullable<string> = SCHEMA_REGISTER.getSchemaResourceName(schema);
        const relationships: Nullable<Array<Location>> = MODEL_REGISTER.getRelationships(model);
        const links: Nullable<Array<Location>> = MODEL_REGISTER.getLinks(model);

        if (!type) {
            throw new SchemaNotRegisteredException(schema);
        }

        if (!fields || !fields.length) {
            throw new SchemaHasNoFieldsException(schema);
        }

        return {
            data: {
                type,
                id: location.toString(),
                attributes: fields.reduce<IAttributes>((result: IAttributes, field: IFieldMapping): IAttributes => {
                    result[field.fieldName] = SCHEMA_REGISTER.serialise(schema, field.propertyName, model[field.propertyName]);

                    return result;
                }, {}),
                relationships: relationships && relationships.length ? relationships.map((relationship: Location): IRelationship => {
                    return {
                        href: relationship.toString(),
                        type: relationship.resourceName,
                        meta: {
                            methods: {
                                GET: true,
                                POST: false,
                                PUT: true,
                                DELETE: true
                            }
                        }
                    };
                }) : undefined,
                links: links && links.length ? links.reduce((acc: ILinks, relationship: Location): ILinks => {
                    acc[relationship.resourceName] = relationship.toString();

                    return acc;
                }, {}) : undefined
            }
        };
    }

    public deserialise(json: IJsonData): any {
        const schema: Nullable<ISchema> = SCHEMA_REGISTER.getSchema(json.data.type);

        if (!schema) {
            throw new ResourceNotRegisteredException(json.data.type);
        }

        const fields: Nullable<Array<IFieldMapping>> = SCHEMA_REGISTER.getFields(schema);

        if (!fields || !fields.length) {
            throw new SchemaHasNoFieldsException(schema);
        }

        const model: any = new schema();

        fields.forEach((field: IFieldMapping) => {
            model[field.propertyName] = SCHEMA_REGISTER.deserialise(schema, field.propertyName, json.data.attributes[field.fieldName]);
        });

        if (json.data.relationships) {
            json.data.relationships.forEach((relationship: IRelationship, index: number) => {
                if (!relationship.href) {
                    throw new InvalidJSONRelationship(index);
                }

                MODEL_REGISTER.addRelationship(model, Location.fromUrl(new Url(relationship.href)));
            });
        }

        return model;
    }
}
