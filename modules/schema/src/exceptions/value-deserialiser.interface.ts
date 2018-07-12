import { IJsonValue, Maybe } from '../../../core/src/index';

export interface IValueDeserialiser {
    (value?: Maybe<IJsonValue>): any;
}
