export interface ISchemaStringValue {
    type: 'string' | ['string', 'null'];
    const?: string;
    enum?: Array<string>;
}
