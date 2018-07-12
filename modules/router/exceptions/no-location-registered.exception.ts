export class NoLocationRegisteredException extends Error {
    constructor(model: any) {
        super(`No location registered for ${JSON.stringify(model)}`);
    }
}
