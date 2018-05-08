import { ResponseMethod, Url } from '../../server/';

export class MethodNotAllowedException extends Error {
    constructor(method: ResponseMethod, url: Url) {
        super(`"${method}" not allowed at "${url.toString()}"`);
    }
}
