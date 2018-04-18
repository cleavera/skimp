export interface ILogger {
    debug(...messages: Array<any>): void; // tslint:disable-line no-any
    warn(...messages: Array<any>): void; // tslint:disable-line no-any
    error(...messages: Array<any>): void; // tslint:disable-line no-any
    exception(error: Error): void;
}
