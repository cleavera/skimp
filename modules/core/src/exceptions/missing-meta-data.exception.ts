export class MissingMetaDataException extends Error {
    constructor(model: any, metaKey: string) {
        super(`${JSON.stringify(model)} is missing the required meta data ${metaKey}`);
    }
}
