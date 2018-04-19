import { Request } from '../../server';

export class ResourceDoesNotExistException extends Error {
    public path: string;

    constructor(request: Request) {
        super(`Resource ${request.url.toString()} does not exist`);
        this.path = request.url.toString();
    }
}
