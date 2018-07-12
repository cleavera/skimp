import { Uri } from '../../http';

export class ResourceDoesNotExistException extends Error {
    public path: string;

    constructor(location: Uri) {
        super(`Resource ${location.toString()} does not exist`);
        this.path = location.toString();
    }
}
