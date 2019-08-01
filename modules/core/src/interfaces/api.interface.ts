import { Maybe } from '@cleavera/utils';
import { ResponseCode } from '@skimp/http';

import { ResourceLocation } from '../classes/resource-location';
import { IResponse } from './response.interface';

export interface IApi {
    respond(response: IResponse, model: any, location: ResourceLocation, created?: boolean): void;
    deserialise(json: any, location: ResourceLocation): any;
    error(response: IResponse, code: ResponseCode, errors?: Maybe<Array<Error>>): void;
}
