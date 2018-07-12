import { Uri } from '../../../http/src/index';

export class InvalidLocationException extends Error {
    constructor(location: Uri) {
        super(`"${location.toString()}" is not a valid location`);
    }
}
