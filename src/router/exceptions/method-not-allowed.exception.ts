import { RequestMethod, Url } from '../../http/';

export class MethodNotAllowedException extends Error {
    constructor(method: RequestMethod, url: Url) {
        super(`"${method}" not allowed at "${url.toString()}"`);
    }
}
