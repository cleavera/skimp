import { IRequest } from '@skimp/core';

export interface IAuthenticator {
    authenticate(request: IRequest): void;
}
