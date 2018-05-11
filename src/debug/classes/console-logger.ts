import { ILogger } from '..';

export class ConsoleLogger implements ILogger {
    public debug(...messages: Array<any>): void { // tslint:disable-line no-any
        console.log(...messages); // tslint:disable-line no-console
    }

    public warn(...messages: Array<Error>): void {
        console.warn(...messages); // tslint:disable-line no-console
    }

    public error(...messages: Array<Error>): void {
        console.error(...messages); // tslint:disable-line no-console
    }
}
