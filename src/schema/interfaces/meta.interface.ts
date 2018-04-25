export interface IMeta {
    get<T = any>(object: any, key: string): T | void; // tslint:disable-line no-any
    set(object: any, key: string, value: any): void; // tslint:disable-line no-any
}
