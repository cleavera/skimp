import { Serialiser as JsonFileSerialiser } from '../../json-file';
import { ISerialiser } from '../interfaces/serialiser.interface';

export class Serialiser {
    public static jsonFile(): ISerialiser {
        return new JsonFileSerialiser();
    }
}
