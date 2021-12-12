import { isEmpty, isNull } from '@cleavera/utils';
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
    private readonly _jsonAPI: IApi;

    constructor() {
        this._jsonAPI = new Api();
    }

    public respond(response: IResponse, _model: object | Array<object>, location: ResourceLocation): void {
        const schema: ISchema | null = SCHEMA_REGISTER.getSchema(location.resourceName);

        if (isNull(schema)) {
            throw new ResourceDoesNotExistException(location);
        }

        response.setAllow(false, false, false);
        response.write(JSON.stringify(this._documentSchema(schema)), 'application/json');
        response.commit();
    }

    public deserialise(_json: string, _location: ResourceLocation): never {
        throw new RequestBodyNotAllowedException();
    }

    public error(response: IResponse, code: ResponseCode, errors: Array<Error> | null = null): void {
        this._jsonAPI.error(response, code, errors);
    }

    private _documentSchema(schema: ISchema): ISchemaRoot<ISchemaObject> {
        const type: string | null = SCHEMA_REGISTER.getSchemaResourceName(schema);
        let fields: Array<string> | null = SCHEMA_REGISTER.getFields(schema);
        const relationships: Array<ISchema> | null = SCHEMA_REGISTER.getSchemaRelationships(schema);

        if (isNull(type)) {
            throw new SchemaNotRegisteredException(schema);
        }

        if (isNull(fields)) {
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
                                const mappedField: string | null = SCHEMA_REGISTER.mapToField(schema, field);
                                const isRequired: boolean = SCHEMA_REGISTER.getFieldRequired(schema, field);

                                if (isNull(mappedField)) {
                                    throw new FieldNotConfiguredException(schema, field);
                                }

                                if (isRequired) {
                                    acc.push(mappedField);
                                }

                                return acc;
                            }, []),
                            properties: fields.reduce<Record<string, ISchemaValue>>((result: Record<string, ISchemaValue>, field: string): Record<string, ISchemaValue> => {
                                const mappedField: string | null = SCHEMA_REGISTER.mapToField(schema, field);
                                const fieldType: FieldType | null = SCHEMA_REGISTER.getFieldType(schema, field);
                                const isRequired: boolean = SCHEMA_REGISTER.getFieldRequired(schema, field);
                                const options: IOptions | null = SCHEMA_REGISTER.getFieldOptions(schema, field);

                                if (isNull(mappedField) || isNull(fieldType)) {
                                    throw new FieldNotConfiguredException(schema, field);
                                }

                                result[mappedField] = {
                                    type: isRequired ? FieldTypeMapping[fieldType] : [
                                        FieldTypeMapping[fieldType],
                                        'null'
                                    ]
                                } as ISchemaTerminatingValue;

                                if (!isNull(options)) {
                                    (result[mappedField] as ISchemaTerminatingValue).enum = options as any; // eslint-disable-line
                                }

                                return result;
                            }, {})
                        }
                    }
                }
            }
        };

        if (!isNull(relationships) && !isEmpty(relationships)) {
            (out.properties.data as ISchemaObject).properties.relationships = {
                type: 'array',
                items: relationships.map((relationship: ISchema): ISchemaObject => {
                    const resourceName: string | null = SCHEMA_REGISTER.getSchemaResourceName(relationship);

                    if (isNull(resourceName)) {
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
