export class FileSystemCannotBeReconfiguredException extends Error {
    constructor() {
        super('The data path cannot be changed while the server is running');
    }
}
