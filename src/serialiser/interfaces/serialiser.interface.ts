import { Url } from '../../server';
import { ISerialisationResult } from './serialisation-result.interface';

export interface ISerialiser {
    serialise(model: any, location: Url): string;
    deserialise(body: string): ISerialisationResult;
}
