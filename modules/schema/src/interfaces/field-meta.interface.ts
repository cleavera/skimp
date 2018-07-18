import { FieldType } from '../constants/field.type';
import { IOptions } from './options.interface';
import { IValueDeserialiser } from './value-deserialiser.interface';
import { IValueSerialiser } from './value-serialiser.interface';

export interface IFieldMeta {
    mappedName?: string;
    serialiser?: IValueSerialiser;
    deserialiser?: IValueDeserialiser;
    type?: FieldType;
    isRequired?: boolean;
    options: IOptions;
}
