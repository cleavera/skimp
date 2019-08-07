export class InvalidPointerException extends Error {
    constructor(model: unknown, property: string) {
        super(`${property} does not exist on ${JSON.stringify(model)}`);
    }
}
