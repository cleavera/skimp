import { ISchemaArray } from './schema-array.interface';
import { ISchemaBooleanValue } from './schema-boolean-value.interface';
import { ISchemaNumberValue } from './schema-number-value.interface';
import { ISchemaObject } from './schema-object.interface';
import { ISchemaStringValue } from './schema-string-value.interface';

export type ISchemaValue = ISchemaBooleanValue | ISchemaNumberValue | ISchemaStringValue | ISchemaObject | ISchemaArray;
