import { ISchemaValue } from './schema-value.interface';

export interface ISchemaObject {
    type: 'object';
    required?: Array<string>;
    properties: {
        [propName: string]: ISchemaValue | void
    };
}
