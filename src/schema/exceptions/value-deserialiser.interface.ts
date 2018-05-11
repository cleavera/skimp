import { IJsonValue, Nullable } from '../../shared';

export interface IValueDeserialiser {
    (value: Nullable<IJsonValue>): any;
}
