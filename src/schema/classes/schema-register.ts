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

        this._meta.set(schema, 'resourceName', resourceName);
    }

    public getSchema(resourceName: string): ISchema | void {
        return this._schemas[resourceName];
    }

    public addField(schema: ISchema, propertyName: string, fieldName: string): void {
        const fields: Array<{ propertyName: string, fieldName: string }> = this._meta.get(schema, 'fields') || [];

        fields.push({ propertyName, fieldName });

        this._meta.set(schema, 'fields', fields);
    }

    public getSchemaResourceName(schema: ISchema): string | void {
        return this._meta.get(schema, 'resourceName');
    }
}
