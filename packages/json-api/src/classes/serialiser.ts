import { isEmpty, isNull, isString, isUndefined } from '@cleavera/utils';
import { MissingCreatedDateException, MODEL_REGISTER, ResourceLocation } from '@skimp/core';
import { NoLocationRegisteredException } from '@skimp/router';
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
    public error(errors: Array<ValidationException>): string {
        const out: IJsonErrors = {
            errors: errors.reduce((acc: Array<IJsonError>, exception: ValidationException) => {
                if (exception instanceof ModelValidationException) {
                    return acc.concat((exception.fields).map((pointer: ModelPointer | null = null): IJsonError => {
                        return {
                            code: exception.code,
                            source: {
                                pointer: isNull(pointer) ? '' : `/data/attributes/${pointer.field}`
                            }
                        };
                    }));
                }

                if (exception instanceof RelationshipValidationException) {
                    return acc.concat((exception.relationships).map((pointer: RelationshipPointer | null = null): IJsonError => {
                        return {
                            code: exception.code,
                            source: {
                                pointer: isNull(pointer) ? '' : `/data/relationships/${pointer.toString()}`
                            }
                        };
                    }));
                }

                acc.push({
                    code: exception.code,
                    source: {
                        pointer: ''
                    }
                });

                return acc;
            }, [])
        };

        return JSON.stringify(out);
    }

    public serialiseModel(model: object, location: ResourceLocation | null = null): string {
        return JSON.stringify(this._mapToModel(model, location));
    }

    public serialiseList(model: Array<object>): string {
        return JSON.stringify(model.sort((a: object, b: object): number => {
            const aCreated: Date | null = MODEL_REGISTER.getCreatedDate(a);
            const bCreated: Date | null = MODEL_REGISTER.getCreatedDate(b);

            if (isNull(aCreated)) {
                throw new MissingCreatedDateException(a);
            }

            if (isNull(bCreated)) {
                throw new MissingCreatedDateException(b);
            }

            if (aCreated < bCreated) {
                return 1;
            }

            if (aCreated > bCreated) {
                return -1;
            }

            return 0;
        }).map((item: object) => {
            const location: ResourceLocation | null = MODEL_REGISTER.getLocation(item);

            if (isNull(location)) {
                throw new NoLocationRegisteredException(item);
            }

            return this._mapToModel(item, location);
        }));
    }

    public deserialise(json: IJsonData): object {
        const schema: ISchema | null = SCHEMA_REGISTER.getSchema(json.data.type);

        if (isNull(schema)) {
            throw new ResourceNotRegisteredException(json.data.type);
        }

        let fields: Array<string> | null = SCHEMA_REGISTER.getFields(schema);

        if (isNull(fields)) {
            fields = [];
        }

        const model: object = new schema();

        fields.forEach((field: string) => {
            const mappedField: string | null = SCHEMA_REGISTER.mapToField(schema, field);

            if (isNull(mappedField)) {
                throw new FieldNotConfiguredException(schema, field);
            }

            (model as any)[field] = SCHEMA_REGISTER.deserialise(schema, field, json.data.attributes[mappedField]); // eslint-disable-line
        });

        if (!isUndefined(json.data.relationships)) {
            json.data.relationships.forEach((relationship: IRelationship, index: number) => {
                if (isUndefined(relationship.href) || !isString(relationship.href)) {
                    throw new InvalidJSONRelationship(index);
                }

                MODEL_REGISTER.addRelationship(model, ResourceLocation.FromString(relationship.href));
            });
        }

        return model;
    }

    private _mapToModel(model: any, location: ResourceLocation | null = null): IJsonData { // eslint-disable-line
        const schema: ISchema = model.constructor;
        let fields: Array<string> | null = SCHEMA_REGISTER.getFields(schema);
        const type: string | null = SCHEMA_REGISTER.getSchemaResourceName(schema);
        const relationships: Array<ResourceLocation> | null = MODEL_REGISTER.getRelationships(model);
        const links: Array<ResourceLocation> | null = MODEL_REGISTER.getLinks(model);

        if (isNull(type)) {
            throw new SchemaNotRegisteredException(schema);
        }

        if (isNull(fields)) {
            fields = [];
        }

        const out: IJsonData = {
            data: {
                type,
                attributes: fields.reduce<IAttributes>((result: IAttributes, field: string): IAttributes => {
                    const mappedField: string | null = SCHEMA_REGISTER.mapToField(schema, field);

                    if (isNull(mappedField)) {
                        throw new FieldNotConfiguredException(schema, field);
                    }

                    result[mappedField] = SCHEMA_REGISTER.serialise(schema, field, model[field]) as string;

                    return result;
                }, {})
            }
        };

        if (!isNull(location)) {
            out.data.id = location.toString();
        }

        if (!isEmpty(relationships ?? null)) {
            out.data.relationships = relationships.map((relationship: ResourceLocation): IRelationship => {
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
            });
        }

        if (!isEmpty(links ?? null)) {
            out.data.links = links.reduce<ILinks>((acc: ILinks, relationship: ResourceLocation): ILinks => {
                acc[relationship.resourceName] = relationship.toString();

                return acc;
            }, {});
        }

        return out;
    }
}
