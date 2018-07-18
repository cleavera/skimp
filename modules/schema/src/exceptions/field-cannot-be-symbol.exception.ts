export class FieldCannotBeSymbolException extends Error {
    constructor(fieldName: symbol) {
        super(`Fields cannot be symbols, field: "${fieldName.toString()}"`);
    }
}
