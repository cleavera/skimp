import { ISerialisationResult } from './serialisation-result.interface';

export interface ISerialiser {
    serialise(model: any, location: string): string;
    deserialise(body: string): ISerialisationResult;
}
