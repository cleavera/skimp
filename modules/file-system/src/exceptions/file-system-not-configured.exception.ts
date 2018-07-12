export class FileSystemNotConfiguredException extends Error {
    constructor() {
        super('The data path has not been configured');
    }
}
