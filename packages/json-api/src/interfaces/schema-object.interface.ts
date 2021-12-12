import { ISchemaValue } from './schema-value.interface';

export interface ISchemaObject {
    type: 'object';
    required?: Array<string>;
    properties: Record<string, ISchemaValue | void>;
}
