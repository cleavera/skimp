export class CannotParseModelWithNoLocationException extends Error {
    constructor() {
        super('Cannot parse a model when no location is provided');
    }
}
