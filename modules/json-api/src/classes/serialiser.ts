import { $isNull, $isString, Maybe } from '@cleavera/utils';
import { MODEL_REGISTER, ResourceLocation } from '@skimp/core';
import { Uri } from '@skimp/http';
import { FieldNotConfiguredException, ISchema, ModelPointer, RelationshipPointer, RelationshipValidationException, ResourceNotRegisteredException, SCHEMA_REGISTER, SchemaNotRegisteredException, ValidationException } from '@skimp/schema';
import { ModelValidationException } from '@skimp/validation';

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

    public serialise(model: any, location: Maybe<ResourceLocation> = null): IJsonData {
        const schema: ISchema = model.constructor;
        let fields: Maybe<Array<string>> = SCHEMA_REGISTER.getFields(schema);
        const type: Maybe<string> = SCHEMA_REGISTER.getSchemaResourceName(schema);
        const relationships: Maybe<Array<ResourceLocation>> = MODEL_REGISTER.getRelationships(model);
        const links: Maybe<Array<ResourceLocation>> = MODEL_REGISTER.getLinks(model);

        if ($isNull(type)) {
            throw new SchemaNotRegisteredException(schema);
        }

        if ($isNull(fields)) {
            fields = [];
        }

        return {
            data: {
                type,
                id: $isNull(location) ? undefined : location.toString(),
                attributes: fields.reduce<IAttributes>((result: IAttributes, field: string): IAttributes => {
                    const mappedField: Maybe<string> = SCHEMA_REGISTER.mapToField(schema, field);

                    if ($isNull(mappedField)) {
                        throw new FieldNotConfiguredException(schema, field);
                    }

                    result[mappedField] = SCHEMA_REGISTER.serialise(schema, field, model[field]);

                    return result;
                }, {}),
                relationships: relationships && relationships.length ? relationships.map((relationship: ResourceLocation): IRelationship => {
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
                links: links && links.length ? links.reduce<ILinks>((acc: ILinks, relationship: ResourceLocation): ILinks => {
                    acc[relationship.resourceName] = relationship.toString();

                    return acc;
                }, {}) : undefined
            }
        };
    }

    public deserialise(json: IJsonData): any {
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(json.data.type);

        if ($isNull(schema)) {
            throw new ResourceNotRegisteredException(json.data.type);
        }

        let fields: Maybe<Array<string>> = SCHEMA_REGISTER.getFields(schema);

        if ($isNull(fields)) {
            fields = [];
        }

        const model: any = new schema();

        fields.forEach((field: string) => {
            const mappedField: Maybe<string> = SCHEMA_REGISTER.mapToField(schema, field);

            if ($isNull(mappedField)) {
                throw new FieldNotConfiguredException(schema, field);
            }

            model[field] = SCHEMA_REGISTER.deserialise(schema, field, json.data.attributes[mappedField]);
        });

        if (json.data.relationships) {
            json.data.relationships.forEach((relationship: IRelationship, index: number) => {
                if (!relationship.href || !$isString(relationship.href)) {
                    throw new InvalidJSONRelationship(index);
                }

                MODEL_REGISTER.addRelationship(model, ResourceLocation.fromUrl(new Uri(relationship.href)));
            });
        }

        return model;
    }
}
