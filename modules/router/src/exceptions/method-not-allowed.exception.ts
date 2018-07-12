import { RequestMethod, Uri } from '../../../http/src/index';

export class MethodNotAllowedException extends Error {
    constructor(method: RequestMethod, url: Uri) {
        super(`"${method}" not allowed at "${url.toString()}"`);
    }
}
