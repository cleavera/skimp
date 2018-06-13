import { IJsonValue, Maybe } from '../../shared';

export interface IValueDeserialiser {
    (value?: Maybe<IJsonValue>): any;
}
