import { Nullable } from './nullable.interface';

export interface IMeta {
    get<T = any>(object: any, key: string): Nullable<T>;
    set(object: any, key: string, value: any): void;
}
