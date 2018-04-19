import { Request } from '../../server/';

export class MethodNotAllowedException extends Error {
    constructor(request: Request) {
        super(`"${request.method}" not allowed at "${request.url.toString()}"`);
    }
}