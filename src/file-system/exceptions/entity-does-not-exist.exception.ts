export class EntityDoesNotExistException extends Error {
    public path: string;

    constructor(path: string) {
        super(`Entity "${path}" does not exist`);

        this.path = path;
    }
}
