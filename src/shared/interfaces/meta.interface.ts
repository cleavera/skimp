import { Maybe } from './maybe.interface';

export interface IMeta {
    get<T = any>(object: any, key: string): Maybe<T>;
    set(object: any, key: string, value: any): void;
}
