import { IMeta, MetaKey, Nullable } from '../../shared';
import { IFieldMapping } from '../interfaces/field-mapping.interface';
import { ISchema } from '../interfaces/schema.interface';

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

    public addField(schema: ISchema, propertyName: string, fieldName: string): void {
        const fields: Array<IFieldMapping> = this._meta.get(schema, MetaKey.FIELDS) || [];

        fields.push({ propertyName, fieldName });

        this._meta.set(schema, MetaKey.FIELDS, fields);
    }

    public getFields(schema: ISchema): Nullable<Array<IFieldMapping>> {
        return this._meta.get(schema, MetaKey.FIELDS);
    }

    public getSchemaResourceName(schema: ISchema): Nullable<string> {
        return this._meta.get(schema, MetaKey.RESOURCE_NAME);
    }
}
