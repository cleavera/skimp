import { ISchemaArray } from './schema-array.interface';
import { ISchemaObject } from './schema-object.interface';
import { ISchemaTerminatingValue } from './schema-terminating-value.interface';

export type ISchemaValue = ISchemaTerminatingValue | ISchemaObject | ISchemaArray;
