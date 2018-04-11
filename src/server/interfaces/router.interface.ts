import { Request } from '../classes/request';
import { Response } from '../classes/response';

export interface IRouter {
    route(request: Request, response: Response): Promise<void>;
}
