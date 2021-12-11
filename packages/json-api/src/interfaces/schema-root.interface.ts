import { ISchemaValue } from './schema-value.interface';

export type ISchemaRoot<T extends ISchemaValue> = {
    $schema: 'http://json-schema.org/draft-04/schema#';
} & T;
