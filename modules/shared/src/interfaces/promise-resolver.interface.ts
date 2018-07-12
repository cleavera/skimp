export type IPromiseResolver<T> = T extends void ? IPromiseResolverWithoutValue : IPromiseResolverWithValue<T>;

export interface IPromiseResolverWithValue<T> {
    (value: T): void;
}

export interface IPromiseResolverWithoutValue {
    (): void;
}
