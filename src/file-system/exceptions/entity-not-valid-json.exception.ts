export class EntityNotValidJsonException extends Error {
    public path: string;

    constructor(path: string, content: string) {
        super(`Entity "${path}" does not contain valid json: \n${content}`);

        this.path = path;
    }
}
