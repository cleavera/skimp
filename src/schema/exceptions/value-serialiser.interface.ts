import { IJsonValue, Maybe } from '../../core';

export interface IValueSerialiser {
    (value: any): Maybe<IJsonValue>;
}
