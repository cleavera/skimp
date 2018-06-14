import { LOGGER } from '../../debug';
import { IMeta, Maybe, MetaKey } from '../../shared';
import { ValidationException, ValidationExceptions } from '../../validation';

import { DuplicateResourceNameException } from '../exceptions/duplicate-resource-name.exception';
import { IValueDeserialiser } from '../exceptions/value-deserialiser.interface';
import { IValueSerialiser } from '../exceptions/value-serialiser.interface';
import { IFieldMapping } from '../interfaces/field-mapping.interface';
import { ISchema } from '../interfaces/schema.interface';
import { IValidation } from '../interfaces/validation.interface';

export class SchemaRegister {
    private readonly _schemas: { [key: string]: ISchema };
    private readonly _meta: IMeta;

    constructor(meta: IMeta) {
        this._meta = meta;
        this._schemas = {};
    }

    public get schemas(): Array<ISchema> {
        return Object.keys(this._schemas).map((key: string) => {
            return this._schemas[key];
        });
    }

    public register(schema: ISchema, resourceName: string, isPrivate?: boolean): void {
        if (this._schemas[resourceName] && !isPrivate) {
            throw new DuplicateResourceNameException(resourceName);
        }

        if (!this._schemas[resourceName] && !isPrivate) {
            this._schemas[resourceName] = schema;
        }

        this._meta.set(schema, MetaKey.RESOURCE_NAME, resourceName);
    }

    public getSchema(resourceName: string): Maybe<ISchema> {
        return this._schemas[resourceName] || null;
    }

    public addSerialiser(schema: ISchema, propertyName: string, serialiser: IValueSerialiser, deserialiser: IValueDeserialiser): void {
        const serialisers: { [key: string]: { serialiser: IValueSerialiser, deserialiser: IValueDeserialiser } } = this._meta.get(schema, MetaKey.SERIALISER) || {};

        serialisers[propertyName] = { serialiser, deserialiser };

        this._meta.set(schema, MetaKey.SERIALISER, serialisers);
    }

    public serialise(schema: ISchema, propertyName: string, value: any): any {
        const serialisers: { [key: string]: { serialiser: IValueSerialiser, deserialiser: IValueDeserialiser } } = this._meta.get(schema, MetaKey.SERIALISER) || {};

        if (!(propertyName in serialisers)) {
            return value;
        }

        return serialisers[propertyName].serialiser(value);
    }

    public deserialise(schema: ISchema, propertyName: string, value: any): any {
        const serialisers: { [key: string]: { serialiser: IValueSerialiser, deserialiser: IValueDeserialiser } } = this._meta.get(schema, MetaKey.SERIALISER) || {};

        if (!(propertyName in serialisers)) {
            return value || null;
        }

        return serialisers[propertyName].deserialiser(value);
    }

    public addValidation(schema: ISchema, validation: IValidation): void {
        const validations: Array<IValidation> = this._meta.get(schema, MetaKey.VALIDATION) || [];

        validations.push(validation);

        this._meta.set(schema, MetaKey.VALIDATION, validations);
    }

    public async validate(model: any): Promise<ValidationExceptions> {
        const validations: Array<IValidation> = this._meta.get(model.constructor, MetaKey.VALIDATION) || [];
        let errors: ValidationExceptions = new ValidationExceptions();

        for (const validate of validations) {
            try {
                await validate(model);
            } catch (e) {
                if (e instanceof ValidationException) {
                    LOGGER.warn(e);
                    errors.push(e);
                } else if (e instanceof ValidationExceptions) {
                    LOGGER.warn(...e);
                    errors = errors.concat(e);
                } else {
                    throw e;
                }
            }
        }

        return errors;
    }

    public addSchemaRelationship(schema: ISchema, relationship: ISchema): void {
        const relationships: Array<ISchema> = this._meta.get(schema, MetaKey.SCHEMA_RELATIONSHIPS) || [];

        relationships.push(relationship);

        this._meta.set(schema, MetaKey.SCHEMA_RELATIONSHIPS, relationships);
    }

    public getSchemaRelationships(schema: ISchema): Maybe<Array<ISchema>> {
        return this._meta.get(schema, MetaKey.SCHEMA_RELATIONSHIPS);
    }

    public addField(schema: ISchema, propertyName: string, fieldName: string): void {
        const fields: Array<IFieldMapping> = this._meta.get(schema, MetaKey.FIELDS) || [];

        fields.push({ propertyName, fieldName });

        this._meta.set(schema, MetaKey.FIELDS, fields);
    }

    public getFields(schema: ISchema): Maybe<Array<IFieldMapping>> {
        return this._meta.get(schema, MetaKey.FIELDS);
    }

    public mapToField(schema: ISchema, property: string): Maybe<string> {
        const fields: Maybe<Array<IFieldMapping>> = this._meta.get(schema, MetaKey.FIELDS);

        if (!fields || !fields.length) {
            return null;
        }

        const matchedField: Maybe<IFieldMapping> = fields.find((field: IFieldMapping) => {
            return field.propertyName === property;
        }) || null;

        if (!matchedField) {
            return null;
        }

        return matchedField.fieldName;
    }

    public getSchemaResourceName(schema: ISchema): Maybe<string> {
        return this._meta.get(schema, MetaKey.RESOURCE_NAME);
    }
}
