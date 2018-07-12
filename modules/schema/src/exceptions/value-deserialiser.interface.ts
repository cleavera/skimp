import { IJsonValue, Maybe } from '../../../shared/src';

export interface IValueDeserialiser {
    (value?: Maybe<IJsonValue>): any;
}
