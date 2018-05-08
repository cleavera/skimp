import { ILogger } from '..';
import { NoLoggerException } from '../exceptions/no-logger.exception';

export class Logger implements ILogger {
    private _logger: ILogger;

    public configure(loggerClass: ILogger): void {
        this._logger = loggerClass;
    }

    public debug(...messages: Array<any>): void {
        if (!this._logger) {
            throw new NoLoggerException();
        }

        this._logger.debug(...messages);
    }

    public warn(...exceptions: Array<Error>): void {
        if (!this._logger) {
            throw new NoLoggerException();
        }

        this._logger.warn(...exceptions.map((exception: Error) => {
            return exception.message;
        }));
    }

    public error(...messages: Array<any>): void { // tslint:disable-line no-any
        if (!this._logger) {
            throw new NoLoggerException();
        }

        this._logger.error(...messages);
    }

    public exception(exception: Error): void {
        if (!this._logger) {
            throw new NoLoggerException();
        }

        this._logger.exception(exception);
    }
}
