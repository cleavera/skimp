import { IRequest } from '../../../http/src/index';

export interface IAuthenticator {
    authenticate(request: IRequest): void;
}
