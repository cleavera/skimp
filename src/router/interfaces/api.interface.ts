import { Response } from '../../server';
import { Location } from '../classes/location';

export interface IApi {
    respond(response: Response, model: any, created?: boolean): void;
    deserialise(json: any, location: Location): any;
}
