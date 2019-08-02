export class NoLocationRegisteredException extends Error {
    constructor(model: unknown) {
        super(`No location registered for ${JSON.stringify(model)}`);
    }
}
