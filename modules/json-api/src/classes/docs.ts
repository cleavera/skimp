import { $isNull, IDict, Maybe, OneOrMany } from '@cleavera/utils';
import { IApi, IResponse, ResourceDoesNotExistException, ResourceLocation, ResponseCode } from '@skimp/core';
import { RequestBodyNotAllowedException } from '@skimp/router';
import { FieldNotConfiguredException, FieldType, IOptions, ISchema, SCHEMA_REGISTER, SchemaNotRegisteredException } from '@skimp/schema';

import { FieldTypeMapping } from '../constants/field-type-mapping.constant';
import { ISchemaObject } from '../interfaces/schema-object.interface';
import { ISchemaRoot } from '../interfaces/schema-root.interface';
import { ISchemaTerminatingValue } from '../interfaces/schema-terminating-value.interface';
import { ISchemaValue } from '../interfaces/schema-value.interface';
import { Api } from './api';

export class Docs implements IApi {
    private _jsonAPI: IApi;

    constructor() {
        this._jsonAPI = new Api();
    }

    public respond(response: IResponse, _model: OneOrMany<object>, location: ResourceLocation): void {
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if ($isNull(schema)) {
            throw new ResourceDoesNotExistException(location);
        }

        response.setAllow(false, false, false);
        response.write(JSON.stringify(this._documentSchema(schema)), 'application/json');
        response.commit();
    }

    public deserialise(_json: string, _location: ResourceLocation): never {
        throw new RequestBodyNotAllowedException();
    }

    public error(response: IResponse, code: ResponseCode, errors: Maybe<Array<Error>> = null): void {
        this._jsonAPI.error(response, code, errors);
    }

    private _documentSchema(schema: ISchema): ISchemaRoot<ISchemaObject> {
        const type: Maybe<string> = SCHEMA_REGISTER.getSchemaResourceName(schema);
        let fields: Maybe<Array<string>> = SCHEMA_REGISTER.getFields(schema);
        const relationships: Maybe<Array<ISchema>> = SCHEMA_REGISTER.getSchemaRelationships(schema);

        if ($isNull(type)) {
            throw new SchemaNotRegisteredException(schema);
        }

        if ($isNull(fields)) {
            fields = [];
        }

        const out: ISchemaRoot<ISchemaObject> = {
            $schema: 'http://json-schema.org/draft-04/schema#',
            type: 'object',
            required: ['data'],
            properties: {
                data: {
                    type: 'object',
                    required: [
                        'type',
                        'id',
                        'attributes'
                    ],
                    properties: {
                        type: {
                            type: 'string',
                            const: type
                        },
                        id: {
                            type: 'string'
                        },
                        attributes: {
                            type: 'object',
                            required: fields.reduce<Array<string>>((acc: Array<string>, field: string) => {
                                const mappedField: Maybe<string> = SCHEMA_REGISTER.mapToField(schema, field);
                                const isRequired: boolean = SCHEMA_REGISTER.getFieldRequired(schema, field);

                                if ($isNull(mappedField)) {
                                    throw new FieldNotConfiguredException(schema, field);
                                }

                                if (isRequired) {
                                    acc.push(mappedField);
                                }

                                return acc;
                            }, []),
                            properties: fields.reduce<IDict<ISchemaValue>>((result: IDict<ISchemaValue>, field: string): IDict<ISchemaValue> => {
                                const mappedField: Maybe<string> = SCHEMA_REGISTER.mapToField(schema, field);
                                const fieldType: Maybe<FieldType> = SCHEMA_REGISTER.getFieldType(schema, field);
                                const isRequired: boolean = SCHEMA_REGISTER.getFieldRequired(schema, field);
                                const options: Maybe<IOptions> = SCHEMA_REGISTER.getFieldOptions(schema, field);

                                if ($isNull(mappedField) || $isNull(fieldType)) {
                                    throw new FieldNotConfiguredException(schema, field);
                                }

                                result[mappedField] = {
                                    type: isRequired ? FieldTypeMapping[fieldType] : [
                                        FieldTypeMapping[fieldType],
                                        'null'
                                    ]
                                } as ISchemaTerminatingValue;

                                if (!$isNull(options)) {
                                    (result[mappedField] as ISchemaTerminatingValue).enum = options as any; // tslint:disable-line no-any
                                }

                                return result;
                            }, {})
                        }
                    }
                }
            }
        };

        if (relationships && relationships.length) {
            (out.properties.data as ISchemaObject).properties.relationships = {
                type: 'array',
                items: relationships.map((relationship: ISchema): ISchemaObject => {
                    const resourceName: Maybe<string> = SCHEMA_REGISTER.getSchemaResourceName(relationship);

                    if ($isNull(resourceName)) {
                        throw new SchemaNotRegisteredException(relationship);
                    }

                    return {
                        type: 'object',
                        required: ['href'],
                        properties: {
                            href: {
                                type: 'string'
                            },
                            type: {
                                type: 'string',
                                const: resourceName
                            },
                            meta: {
                                type: 'object',
                                properties: {
                                    methods: {
                                        type: 'object',
                                        required: [
                                            'GET',
                                            'POST',
                                            'PUT',
                                            'DELETE'
                                        ],
                                        properties: {
                                            GET: {
                                                type: 'boolean'
                                            },
                                            POST: {
                                                type: 'boolean'
                                            },
                                            PUT: {
                                                type: 'boolean'
                                            },
                                            DELETE: {
                                                type: 'boolean'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };
                })
            };
        }

        return out;
    }
}
