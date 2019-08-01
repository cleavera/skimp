export class InvalidLocationException extends Error {
    constructor(location: string) {
        super(`"${location}" is not a valid location`);
    }
}
