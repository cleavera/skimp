export interface ISchemaNumberValue {
    type: 'number' | 'integer' | ['number', 'null'] | ['integer', 'null'] | ['integer', 'number', 'null'];
    const?: number;
    enum?: Array<number>;
}
