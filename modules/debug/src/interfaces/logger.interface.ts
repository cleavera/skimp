export interface ILogger {
    debug(...messages: Array<any>): void; // eslint-disable-line
    warn(...messages: Array<Error>): void;
    error(...messages: Array<Error>): void;
}
