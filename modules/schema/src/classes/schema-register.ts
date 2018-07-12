import { IMeta, MetaKey } from '../../../core/src/index';
import { LOGGER } from '../../../debug/src/index';
import { Maybe } from '../../../shared/src';

import { FieldType } from '../constants/field.type';
import { DuplicateResourceNameException } from '../exceptions/duplicate-resource-name.exception';
import { ValidationException } from '../exceptions/validation.exception';
import { ValidationExceptions } from '../exceptions/validation.exceptions';
import { IValueDeserialiser } from '../exceptions/value-deserialiser.interface';
import { IValueSerialiser } from '../exceptions/value-serialiser.interface';
import { IFieldMeta } from '../interfaces/field-meta.interface';
import { IOptions } from '../interfaces/options.interface';
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

    public addSerialiser(schema: ISchema, field: string, serialiser: IValueSerialiser, deserialiser: IValueDeserialiser): void {
        const fieldMeta: IFieldMeta = this.getFieldMeta(schema, field);

        fieldMeta.serialiser = serialiser;
        fieldMeta.deserialiser = deserialiser;

        this.setFieldMeta(schema, field, fieldMeta);
    }

    public serialise(schema: ISchema, field: string, value: any): any {
        const fieldMeta: IFieldMeta = this.getFieldMeta(schema, field);

        if (!fieldMeta.serialiser) {
            return value;
        }

        return fieldMeta.serialiser(value);
    }

    public deserialise(schema: ISchema, field: string, value: any): any {
        const fieldMeta: IFieldMeta = this.getFieldMeta(schema, field);

        if (!fieldMeta.deserialiser) {
            return value || null;
        }

        return fieldMeta.deserialiser(value);
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

    public addFieldMapping(schema: ISchema, propertyName: string, fieldName: string): void {
        const field: IFieldMeta = this.getFieldMeta(schema, propertyName);

        field.mappedName = fieldName;

        this.setFieldMeta(schema, propertyName, field);
    }

    public setFieldType(schema: ISchema, propertyName: string, type: FieldType): void {
        const field: IFieldMeta = this.getFieldMeta(schema, propertyName);

        field.type = type;

        this.setFieldMeta(schema, propertyName, field);
    }

    public setFieldOptions(schema: ISchema, propertyName: string, options: IOptions<any>): void {
        const field: IFieldMeta = this.getFieldMeta(schema, propertyName);

        field.options = options;

        this.setFieldMeta(schema, propertyName, field);
    }

    public getFieldOptions(schema: ISchema, propertyName: string): Maybe<IOptions> {
        const field: IFieldMeta = this.getFieldMeta(schema, propertyName);

        return field.options || null;
    }

    public setFieldRequired(schema: ISchema, propertyName: string, isRequired: boolean): void {
        const field: IFieldMeta = this.getFieldMeta(schema, propertyName);

        field.isRequired = isRequired;

        this.setFieldMeta(schema, propertyName, field);
    }

    public getFieldRequired(schema: ISchema, propertyName: string): boolean {
        const field: IFieldMeta = this.getFieldMeta(schema, propertyName);

        return field.isRequired || false;
    }

    public getFieldType(schema: ISchema, propertyName: string): Maybe<FieldType> {
        const field: IFieldMeta = this.getFieldMeta(schema, propertyName);

        if (!('type' in field) || field === void 0) {
            return null;
        }

        return (field as { type: FieldType }).type;
    }

    public getFieldMeta(schema: ISchema, fieldName: string): IFieldMeta {
        const fields: { [field: string]: IFieldMeta } = this._meta.get(schema, MetaKey.FIELDS) || {};

        return fields[fieldName] || {};
    }

    public setFieldMeta(schema: ISchema, fieldName: string, meta: IFieldMeta): void {
        const fields: { [field: string]: IFieldMeta } = this._meta.get(schema, MetaKey.FIELDS) || {};

        fields[fieldName] = meta;

        this._meta.set(schema, MetaKey.FIELDS, fields);
    }

    public getFields(schema: ISchema): Maybe<Array<string>> {
        const fields: Maybe<{ [field: string]: IFieldMeta }> = this._meta.get(schema, MetaKey.FIELDS);

        if (!fields) {
            return null;
        }

        return Object.keys(fields);
    }

    public mapToField(schema: ISchema, property: string): Maybe<string> {
        const field: IFieldMeta = this.getFieldMeta(schema, property);

        if (!field) {
            return null;
        }

        if (!field.mappedName) {
            return null;
        }

        return field.mappedName;
    }

    public getSchemaResourceName(schema: ISchema): Maybe<string> {
        return this._meta.get(schema, MetaKey.RESOURCE_NAME);
    }
}
