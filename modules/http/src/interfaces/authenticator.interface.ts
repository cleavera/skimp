import { IHttpRequest } from './http-request.interface';

export interface IAuthenticator {
    authenticate(request: IHttpRequest): Promise<void>;
}
