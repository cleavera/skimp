export interface IContent {
    raw: string;

    json<T = any>(): T;
}
