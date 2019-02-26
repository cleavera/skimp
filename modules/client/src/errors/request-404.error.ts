import { HttpStatus } from '../constants/http-status.constant';
import { HttpError } from './http.error';

export class Request404Error extends HttpError {
    constructor(url: string) {
        super(HttpStatus.NOT_FOUND, url);
    }
}
