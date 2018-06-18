import { ISchemaValue } from './schema-value.interface';

export interface ISchemaArray {
    type: 'array';
    items: Array<ISchemaValue>;
}
