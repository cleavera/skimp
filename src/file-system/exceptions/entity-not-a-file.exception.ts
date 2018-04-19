export class EntityNotAFileException extends Error {
    public path: string;

    constructor(path: string) {
        super(`Entity "${path}" is not a file`);

        this.path = path;
    }
}
