import { Nullable } from '../../shared';

export interface IMeta {
    get<T = any>(object: any, key: string): Nullable<T>; // tslint:disable-line no-any
    set(object: any, key: string, value: any): void; // tslint:disable-line no-any
}
