import { Url } from '../../http';

export class ResourceDoesNotExistException extends Error {
    public path: string;

    constructor(location: Url) {
        super(`Resource ${location.toString()} does not exist`);
        this.path = location.toString();
    }
}
