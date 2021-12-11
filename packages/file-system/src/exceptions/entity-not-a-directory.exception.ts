export class EntityNotADirectoryException extends Error {
    public path: string;

    constructor(path: string) {
        super(`Entity "${path}" is not a directory`);

        this.path = path;
    }
}
