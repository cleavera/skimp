import { LOGGER } from '../../debug';
import { IMeta, MetaKey, Nullable } from '../../shared';
import { ModelValidationException } from '../exceptions/model-validation.exception';
import { ModelValidationExceptions } from '../exceptions/model-validation.exceptions';
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

    public register(schema: ISchema, resourceName: string): void {
        if (!this._schemas[resourceName]) {
            this._schemas[resourceName] = schema;
        }

        this._meta.set(schema, MetaKey.RESOURCE_NAME, resourceName);
    }

    public getSchema(resourceName: string): Nullable<ISchema> {
        return this._schemas[resourceName];
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
            return value;
        }

        return serialisers[propertyName].deserialiser(value);
    }

    public addValidation(schema: ISchema, validation: IValidation): void {
        const validations: Array<IValidation> = this._meta.get(schema, MetaKey.VALIDATION) || [];

        validations.push(validation);

        this._meta.set(schema, MetaKey.VALIDATION, validations);
    }

    public validate(model: any): ModelValidationExceptions {
        const validations: Array<IValidation> = this._meta.get(model.constructor, MetaKey.VALIDATION) || [];
        const errors: ModelValidationExceptions = new ModelValidationExceptions();

        validations.forEach((validate: IValidation) => {
            try {
                validate(model);
            } catch (e) {
                if (e instanceof ModelValidationException) {
                    LOGGER.warn(e);
                    errors.push(e);
                } else {
                    throw e;
                }
            }
        });

        return errors;
    }

    public addField(schema: ISchema, propertyName: string, fieldName: string): void {
        const fields: Array<IFieldMapping> = this._meta.get(schema, MetaKey.FIELDS) || [];

        fields.push({ propertyName, fieldName });

        this._meta.set(schema, MetaKey.FIELDS, fields);
    }

    public getFields(schema: ISchema): Nullable<Array<IFieldMapping>> {
        return this._meta.get(schema, MetaKey.FIELDS);
    }

    public mapToField(schema: ISchema, property: string): Nullable<string> {
        const fields: Nullable<Array<IFieldMapping>> = this._meta.get(schema, MetaKey.FIELDS);

        if (!fields || !fields.length) {
            return;
        }

        const matchedField: Nullable<IFieldMapping> = fields.find((field: IFieldMapping) => {
            return field.propertyName === property;
        });

        if (!matchedField) {
            return;
        }

        return matchedField.fieldName;
    }

    public getSchemaResourceName(schema: ISchema): Nullable<string> {
        return this._meta.get(schema, MetaKey.RESOURCE_NAME);
    }
}
