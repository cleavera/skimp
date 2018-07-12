import { IJsonValue, Maybe } from '../../../core/src/index';

export interface IValueSerialiser {
    (value: any): Maybe<IJsonValue>;
}
