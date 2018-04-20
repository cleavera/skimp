import uuid = require('uuid');
import { ISchema } from '../interfaces/schema.interface';

export class SchemaRegister {
    private readonly _schemas: { [key: string]: ISchema };
    private readonly  _metaData: { [key: string]: { [metaDataKey: string]: any }}; // tslint:disable-line no-any

    constructor() {
        this._schemas = {};
        this._metaData = {};
    }

    public get schemas(): Array<ISchema> {
        return Object.keys(this._schemas).map((key: string) => {
            return this._schemas[key];
        });
    }

    public register(schema: ISchema): string {
        const schemaId: string = uuid.v4();

        this._schemas[schemaId] = schema;

        return schemaId;
    }

    public getSchemaId(schema: ISchema): string | void {
        for (const schemaId in this._schemas) {
            if (this._schemas[schemaId] === schema) {
                return schemaId;
            }
        }
    }

    public addMeta(schemaId: string, metaKey: string, value: any): void { // tslint:disable-line no-any
        if (!this._metaData[schemaId]) {
            this._metaData[schemaId] = {};
        }

        this._metaData[schemaId][metaKey] = value;
    }

    public getMeta<T = any>(schemaId: string, metaKey: string): T { // tslint:disable-line no-any
        if (!this._metaData[schemaId]) {
            this._metaData[schemaId] = {};
        }

        return this._metaData[schemaId][metaKey];
    }
}
