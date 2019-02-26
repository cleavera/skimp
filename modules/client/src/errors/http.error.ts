import { HttpStatus } from '../constants/http-status.constant';

export class HttpError {
    public status: HttpStatus;
    public url: string;

    constructor(status: HttpStatus, url: string) {
        this.status = status;
        this.url = url;
    }
}
