import { IJsonValue, Maybe } from '../../../shared/src';

export interface IValueSerialiser {
    (value: any): Maybe<IJsonValue>;
}
