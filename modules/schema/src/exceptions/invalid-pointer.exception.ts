export class InvalidPointerException extends Error {
    constructor(model: any, property: string) {
        super(`${property} does not exist on ${JSON.stringify(model)}`);
    }
}
