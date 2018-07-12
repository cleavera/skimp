export interface IPromiseRejector<T extends Error = Error> {
    (value: T): void;
}
