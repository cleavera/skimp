import { IRequest } from './request.interface';
import { IResponse } from './response.interface';

export interface IRouter {
    route(request: IRequest, response: IResponse): Promise<void>;
}
