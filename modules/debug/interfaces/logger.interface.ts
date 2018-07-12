export interface ILogger {
    debug(...messages: Array<any>): void; // tslint:disable-line no-any
    warn(...messages: Array<Error>): void;
    error(...messages: Array<Error>): void;
}
