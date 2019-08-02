import { Maybe } from '@cleavera/utils';

export interface IMeta {
    get<T = unknown>(object: object, key: string): Maybe<T>;
    set(object: object, key: string, value: unknown): void;
}
