import { IJsonValue, Maybe } from '@cleavera/utils';

export interface IValueDeserialiser {
    (value?: Maybe<IJsonValue>): any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
