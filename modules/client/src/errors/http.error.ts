import { HttpStatusCode } from '../constants/http-status.constant';

export class HttpError extends Error {
    public status: HttpStatusCode;
    public url: string;

    constructor(status: HttpStatusCode, url: string) {
        super();

        this.status = status;
        this.url = url;
    }
}
