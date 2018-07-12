import { IRequest } from '@skimp/http';

export interface IAuthenticator {
    authenticate(request: IRequest): void;
}
