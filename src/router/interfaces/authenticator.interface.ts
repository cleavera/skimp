import { Request } from '../../server';

export interface IAuthenticator {
    authenticate(request: Request): void;
}
