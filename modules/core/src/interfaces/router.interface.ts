import { IRequest, IResponse } from '@skimp/http';

export interface IRouter {
    route(request: IRequest, response: IResponse): Promise<void>;
}
