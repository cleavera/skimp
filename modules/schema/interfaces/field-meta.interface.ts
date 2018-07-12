import { FieldType } from '../constants/field.type';
import { IValueDeserialiser } from '../exceptions/value-deserialiser.interface';
import { IValueSerialiser } from '../exceptions/value-serialiser.interface';
import { IOptions } from './options.interface';

export interface IFieldMeta {
    mappedName?: string;
    serialiser?: IValueSerialiser;
    deserialiser?: IValueDeserialiser;
    type?: FieldType;
    isRequired?: boolean;
    options: IOptions;
}
