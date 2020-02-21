import { IJsonValue, Maybe } from '@cleavera/utils';

export interface IValueSerialiser<T = unknown> {
    (value: T): Maybe<IJsonValue>;
}
