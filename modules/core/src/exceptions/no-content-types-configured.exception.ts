export class NoContentTypesConfiguredException extends Error {
    constructor() {
        super(`No content types have been configured`);
    }
}
