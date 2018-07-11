import { Url } from '../../http';

export class InvalidLocationException extends Error {
    constructor(location: Url) {
        super(`"${location.toString()}" is not a valid location`);
    }
}
