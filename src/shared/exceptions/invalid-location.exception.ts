import { Uri } from '../../http';

export class InvalidLocationException extends Error {
    constructor(location: Uri) {
        super(`"${location.toString()}" is not a valid location`);
    }
}
