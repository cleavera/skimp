import { isNull, isUndefined } from '@cleavera/utils';
import { IMeta, MetaKey } from '@skimp/core';
import { LOGGER } from '@skimp/debug';
import { JsonPrimitive } from 'type-fest';

import { FieldType } from '../constants/field.type';
import { DuplicateResourceNameException } from '../exceptions/duplicate-resource-name.exception';
import { ValidationException } from '../exceptions/validation.exception';
import { ValidationExceptions } from '../exceptions/validation.exceptions';
import { IFieldMeta } from '../interfaces/field-meta.interface';
import { IOptions } from '../interfaces/options.interface';
import { ISchema } from '../interfaces/schema.interface';
import { IValidation } from '../interfaces/validation.interface';
import { IValueDeserialiser } from '../interfaces/value-deserialiser.interface';
import { IValueSerialiser } from '../interfaces/value-serialiser.interface';

export class SchemaRegister {
    private readonly _schemas: Record<string, ISchema>;
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

    public register(schema: ISchema, resourceName: string, isPrivate: boolean = false): void {
        if (!(isNull(this._schemas[resourceName]) || isUndefined(this._schemas[resourceName])) && !isPrivate) {
            throw new DuplicateResourceNameException(resourceName);
        }

        if (!isPrivate) {
            this._schemas[resourceName] = schema;
        }

        this._meta.set(schema, MetaKey.RESOURCE_NAME, resourceName);
    }

    public getSchema(resourceName: string): ISchema | null {
        return this._schemas[resourceName] ?? null;
    }

    public addSerialiser(schema: ISchema, field: string, serialiser: IValueSerialiser, deserialiser: IValueDeserialiser): void {
        const fieldMeta: IFieldMeta = this.getFieldMeta(schema, field);

        fieldMeta.serialiser = serialiser;
        fieldMeta.deserialiser = deserialiser;

        this.setFieldMeta(schema, field, fieldMeta);
    }

    public serialise(schema: ISchema, field: string, value: unknown): unknown {
        const fieldMeta: IFieldMeta = this.getFieldMeta(schema, field);

        if (isUndefined(fieldMeta.serialiser)) {
            return value;
        }

        return fieldMeta.serialiser(value);
    }

    public deserialise(schema: ISchema, field: string, value: JsonPrimitive | null): unknown {
        const fieldMeta: IFieldMeta = this.getFieldMeta(schema, field);

        if (isUndefined(fieldMeta.deserialiser)) {
            return value ?? null;
        }

        return fieldMeta.deserialiser(value);
    }

    public addValidation(schema: ISchema, validation: IValidation): void {
        const validations: Array<IValidation> = this._meta.get(schema, MetaKey.VALIDATION) ?? [];

        validations.push(validation);

        this._meta.set(schema, MetaKey.VALIDATION, validations);
    }

    public async validate(model: object): Promise<ValidationExceptions> {
        const validations: Array<IValidation> = this._meta.get(model.constructor, MetaKey.VALIDATION) ?? [];
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
        const relationships: Array<ISchema> = this._meta.get(schema, MetaKey.SCHEMA_RELATIONSHIPS) ?? [];

        relationships.push(relationship);

        this._meta.set(schema, MetaKey.SCHEMA_RELATIONSHIPS, relationships);
    }

    public getSchemaRelationships(schema: ISchema): Array<ISchema> | null {
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

    public setFieldOptions(schema: ISchema, propertyName: string, options: IOptions): void {
        const field: IFieldMeta = this.getFieldMeta(schema, propertyName);

        field.options = options;

        this.setFieldMeta(schema, propertyName, field);
    }

    public getFieldOptions(schema: ISchema, propertyName: string): IOptions | null {
        const field: IFieldMeta = this.getFieldMeta(schema, propertyName);

        return field.options ?? null;
    }

    public setFieldRequired(schema: ISchema, propertyName: string, isRequired: boolean): void {
        const field: IFieldMeta = this.getFieldMeta(schema, propertyName);

        field.isRequired = isRequired;

        this.setFieldMeta(schema, propertyName, field);
    }

    public getFieldRequired(schema: ISchema, propertyName: string): boolean {
        const field: IFieldMeta = this.getFieldMeta(schema, propertyName);

        return field.isRequired ?? false;
    }

    public getFieldType(schema: ISchema, propertyName: string): FieldType | null {
        const field: IFieldMeta = this.getFieldMeta(schema, propertyName);

        if (!('type' in field)) {
            return null;
        }

        return (field as { type: FieldType; }).type;
    }

    public getFieldMeta(schema: ISchema, fieldName: string): IFieldMeta {
        const fields: Record<string, IFieldMeta> = this._meta.get(schema, MetaKey.FIELDS) ?? {};

        return fields[fieldName] ?? {};
    }

    public setFieldMeta(schema: ISchema, fieldName: string, meta: IFieldMeta): void {
        const fields: Record<string, IFieldMeta> = this._meta.get(schema, MetaKey.FIELDS) ?? {};

        fields[fieldName] = meta;

        this._meta.set(schema, MetaKey.FIELDS, fields);
    }

    public getFields(schema: ISchema): Array<string> | null {
        const fields: Record<string, IFieldMeta> | null = this._meta.get(schema, MetaKey.FIELDS);

        if (isNull(fields)) {
            return null;
        }

        return Object.keys(fields);
    }

    public mapToField(schema: ISchema, property: string): string | null {
        const field: IFieldMeta = this.getFieldMeta(schema, property);

        return field?.mappedName ?? null;
    }

    public getSchemaResourceName(schema: ISchema): string | null {
        return this._meta.get(schema, MetaKey.RESOURCE_NAME);
    }
}
