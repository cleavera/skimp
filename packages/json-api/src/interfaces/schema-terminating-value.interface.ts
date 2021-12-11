import { ISchemaBooleanValue } from './schema-boolean-value.interface';
import { ISchemaNumberValue } from './schema-number-value.interface';
import { ISchemaStringValue } from './schema-string-value.interface';

export type ISchemaTerminatingValue = ISchemaBooleanValue | ISchemaNumberValue | ISchemaStringValue;
