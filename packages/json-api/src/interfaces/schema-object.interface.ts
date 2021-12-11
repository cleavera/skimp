import { IDict } from '@cleavera/utils';

import { ISchemaValue } from './schema-value.interface';

export interface ISchemaObject {
    type: 'object';
    required?: Array<string>;
    properties: IDict<ISchemaValue | void>;
}
