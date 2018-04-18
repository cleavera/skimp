import { ILogger } from '..';

export class ConsoleLogger implements ILogger {
    public debug(...messages: Array<any>): void { // tslint:disable-line no-any
        console.debug(...messages); // tslint:disable-line no-console
    }

    public warn(...messages: Array<any>): void { // tslint:disable-line no-any
        console.warn(...messages); // tslint:disable-line no-console
    }

    public error(...messages: Array<any>): void { // tslint:disable-line no-any
        console.error(...messages); // tslint:disable-line no-console
    }

    public exception(exception: Error): void {
        console.error(exception); // tslint:disable-line no-console
    }
}
