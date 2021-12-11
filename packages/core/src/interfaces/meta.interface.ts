export interface IMeta {
    get<T = unknown>(object: object, key: string): T | null;
    set(object: object, key: string, value: unknown): void;
}
