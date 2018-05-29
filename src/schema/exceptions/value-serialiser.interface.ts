import { IJsonValue, Maybe } from '../../shared';

export interface IValueSerialiser {
    (value: any): Maybe<IJsonValue>;
}
