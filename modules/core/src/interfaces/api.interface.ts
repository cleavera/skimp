import { ResourceLocation } from '../classes/resource-location';
import { ResponseCode } from '../constants/response-code.constant';
import { IResponse } from './response.interface';

export interface IApi {
    respond(response: IResponse, model: object | Array<object>, location: ResourceLocation, created?: boolean): void;

    deserialise(content: string, location: ResourceLocation): object;

    error(response: IResponse, code: ResponseCode, errors?: Array<Error> | null): void;
}
