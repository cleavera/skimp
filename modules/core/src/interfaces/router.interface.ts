import { IResponse } from '@skimp/http';
import { IRequest } from './request.interface';

export interface IRouter {
    route(request: IRequest, response: IResponse): Promise<void>;
}
