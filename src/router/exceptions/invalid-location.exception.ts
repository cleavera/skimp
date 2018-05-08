import { Url } from '../../server';

export class InvalidLocationException extends Error {
    constructor(location: Url) {
        super(`"${location.toString()}" is not a valid location`);
    }
}