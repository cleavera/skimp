import { HttpRequest } from '../classes/http-request';

export interface IAuthenticator {
    authenticate(request: HttpRequest): Promise<boolean>;
}
