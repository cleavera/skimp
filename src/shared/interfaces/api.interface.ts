import { IResponse, ResponseCode } from '../../http';

import { Location } from '../classes/location';

export interface IApi {
    respond(response: IResponse, model: any, location: Location, created?: boolean): void;
    deserialise(json: any, location: Location): any;
    error(response: IResponse, code: ResponseCode, errors?: Array<Error>): void;
}
