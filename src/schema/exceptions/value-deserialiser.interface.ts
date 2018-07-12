import { IJsonValue, Maybe } from '../../core';

export interface IValueDeserialiser {
    (value?: Maybe<IJsonValue>): any;
}
