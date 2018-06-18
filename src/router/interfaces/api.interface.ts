import { Response, ResponseCode } from '../../server';

import { Location } from '../classes/location';

export interface IApi {
    respond(response: Response, model: any, location: Location, created?: boolean): void;
    deserialise(json: any, location: Location): any;
    error(response: Response, code: ResponseCode, errors?: Array<Error>): void;
}
