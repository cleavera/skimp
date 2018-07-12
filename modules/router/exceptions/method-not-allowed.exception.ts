import { RequestMethod, Uri } from '../../http';

export class MethodNotAllowedException extends Error {
    constructor(method: RequestMethod, url: Uri) {
        super(`"${method}" not allowed at "${url.toString()}"`);
    }
}
