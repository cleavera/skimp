import * as MetaKey from '../constants/meta-field-names.constant';
import { IFieldMapping } from '../interfaces/field-mapping.interface';
import { IMeta } from '../interfaces/meta.interface';
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

    public getSchema(resourceName: string): ISchema | void {
        return this._schemas[resourceName];
    }

    public addField(schema: ISchema, propertyName: string, fieldName: string): void {
        const fields: Array<IFieldMapping> = this._meta.get(schema, MetaKey.FIELDS) || [];

        fields.push({ propertyName, fieldName });

        this._meta.set(schema, MetaKey.FIELDS, fields);
    }

    public getFields(schema: ISchema): Array<IFieldMapping> | void {
        return this._meta.get(schema, MetaKey.FIELDS);
    }

    public getSchemaResourceName(schema: ISchema): string | void {
        return this._meta.get(schema, MetaKey.RESOURCE_NAME);
    }
}
