import { IJsonValue, Nullable } from '../../shared';

export interface IValueSerialiser {
    (value: any): Nullable<IJsonValue>;
}
