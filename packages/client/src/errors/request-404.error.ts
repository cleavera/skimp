import { HttpStatusCode } from '../constants/http-status.constant';
import { HttpError } from './http.error';

export class Request404Error extends HttpError {
    constructor(url: string) {
        super(HttpStatusCode.NOT_FOUND, url);
    }
}
