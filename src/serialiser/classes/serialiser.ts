import { Serialiser as JsonApiSerialiser } from '../../json-api';
import { Serialiser as JsonFileSerialiser } from '../../json-file';
import { ISerialiser } from '../interfaces/serialiser.interface';

export class Serialiser {
    public static jsonApi(): ISerialiser {
        return new JsonApiSerialiser();
    }

    public static jsonFile(): ISerialiser {
        return new JsonFileSerialiser();
    }
}
