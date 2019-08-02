import { IJsonValue, Maybe } from '@cleavera/utils';

export interface IValueDeserialiser {
    (value?: Maybe<IJsonValue>): object;
}
