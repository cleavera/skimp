import { ILogger } from '../interfaces/logger.interface';

export class ConsoleLogger implements ILogger {
    public debug(...messages: Array<any>): void { // tslint:disable-line no-any
        console.log(...messages); // eslint-disable-line no-console
    }

    public warn(...messages: Array<Error>): void {
        console.warn(...messages); // eslint-disable-line no-console
    }

    public error(...messages: Array<Error>): void {
        console.error(...messages); // eslint-disable-line no-console
    }
}
