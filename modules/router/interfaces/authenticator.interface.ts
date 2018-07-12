import { IRequest } from '../../http';

export interface IAuthenticator {
    authenticate(request: IRequest): void;
}
