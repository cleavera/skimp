export class InvalidDatabaseFilePathException extends Error {
    constructor(path: string) {
        super(`Invalid file path exists in the database: "${path}"`);
    }
}
