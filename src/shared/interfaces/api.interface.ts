import { IResponse, ResponseCode } from '../../http';

import { ResourceLocation } from '../classes/resource.location';

export interface IApi {
    respond(response: IResponse, model: any, location: ResourceLocation, created?: boolean): void;
    deserialise(json: any, location: ResourceLocation): any;
    error(response: IResponse, code: ResponseCode, errors?: Array<Error>): void;
}
