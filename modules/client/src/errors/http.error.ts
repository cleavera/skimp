import { HttpStatus } from '../constants/http-status.constant';

export class HttpError extends Error {
    public status: HttpStatus;
    public url: string;

    constructor(status: HttpStatus, url: string) {
        super();

        this.status = status;
        this.url = url;
    }
}
