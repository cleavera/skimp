export interface ISchemaBooleanValue {
    type: 'boolean' | ['boolean', 'null'];
    const?: boolean;
    enum?: Array<boolean>;
}
