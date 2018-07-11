import { IResponse, ResponseCode } from '../../http';
import { IApi, Location, RequestBodyNotAllowedException, ResourceDoesNotExistException } from '../../router';
import { FieldNotConfiguredException, FieldType, ISchema, SCHEMA_REGISTER, SchemaHasNoFieldsException, SchemaNotRegisteredException } from '../../schema';
import { Maybe } from '../../shared';
import { IOptions } from '../../validation';
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

    public respond(response: IResponse, _model: Array<any> | any, location: Location): void {
        const schema: Maybe<ISchema> = SCHEMA_REGISTER.getSchema(location.resourceName);

        if (!schema) {
            throw new ResourceDoesNotExistException(location.toUrl());
        }

        response.setAllow(false, false, false);
        response.json(this._documentSchema(schema));
        response.commit();
    }

    public deserialise(_json: any, _location: Location): any {
        throw new RequestBodyNotAllowedException();
    }

    public error(response: IResponse, code: ResponseCode, errors?: Array<Error>): void {
        this._jsonAPI.error(response, code, errors);
    }

    private _documentSchema(schema: ISchema): ISchemaRoot<ISchemaObject> {
        const type: Maybe<string> = SCHEMA_REGISTER.getSchemaResourceName(schema);
        const fields: Maybe<Array<string>> = SCHEMA_REGISTER.getFields(schema);
        const relationships: Maybe<Array<ISchema>> = SCHEMA_REGISTER.getSchemaRelationships(schema);

        if (!type) {
            throw new SchemaNotRegisteredException(schema);
        }

        if (!fields || !fields.length) {
            throw new SchemaHasNoFieldsException(schema);
        }

        return {
            $schema: 'http://json-schema.org/draft-04/schema#',
            type: 'object',
            required: ['data'],
            properties: {
                data: {
                    type: 'object',
                    required: ['type', 'id', 'attributes'],
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

                                if (!mappedField) {
                                    throw new FieldNotConfiguredException(schema, field);
                                }

                                if (isRequired) {
                                    acc.push(mappedField);
                                }

                                return acc;
                            }, []),
                            properties: fields.reduce<{ [propName: string]: ISchemaValue }>((result: { [propName: string]: ISchemaValue }, field: string): { [propName: string]: ISchemaValue } => {
                                const mappedField: Maybe<string> = SCHEMA_REGISTER.mapToField(schema, field);
                                const fieldType: Maybe<FieldType> = SCHEMA_REGISTER.getFieldType(schema, field);
                                const isRequired: boolean = SCHEMA_REGISTER.getFieldRequired(schema, field);
                                const options: Maybe<IOptions> = SCHEMA_REGISTER.getFieldOptions(schema, field);

                                if (!mappedField || fieldType === null) {
                                    throw new FieldNotConfiguredException(schema, field);
                                }

                                result[mappedField] = {
                                    type: isRequired ? FieldTypeMapping[fieldType] : [FieldTypeMapping[fieldType], 'null']
                                } as ISchemaTerminatingValue;

                                if (options) {
                                    (result[mappedField] as ISchemaTerminatingValue).enum = options as any;
                                }

                                return result;
                            }, {})
                        },
                        relationships: relationships && relationships.length ? {
                            type: 'array',
                            items: relationships.map((relationship: ISchema): ISchemaObject => {
                                const resourceName: Maybe<string> = SCHEMA_REGISTER.getSchemaResourceName(relationship);

                                if (!resourceName) {
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
                                                    required: ['GET', 'POST', 'PUT', 'DELETE'],
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
                        } : undefined
                    }
                }
            }
        };
    }
}
