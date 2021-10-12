export interface ILogger {
    debug(...messages: Array<any>): void; // eslint-disable-line @typescript-eslint/no-explicit-any
    warn(...messages: Array<Error>): void;
    error(...messages: Array<Error>): void;
}
