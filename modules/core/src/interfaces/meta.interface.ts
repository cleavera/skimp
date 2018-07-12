import { Maybe } from '../../../shared/src';

export interface IMeta {
    get<T = any>(object: any, key: string): Maybe<T>;
    set(object: any, key: string, value: any): void;
}
